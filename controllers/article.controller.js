const { validationResult } = require("express-validator");
const Article = require("../models/Article.model");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
  FOLDERS,
} = require("../config/cloudinary.config");

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  return null;
};

const parseIsPublished = (value) => {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  return true;
};

const parseTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => t.trim()).filter(Boolean);
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
};

const getAllArticles = async (req, res, next) => {
  try {
    const { published, category, page = 1, limit = 20, search } = req.query;

    const filter = {};

    if (published === "true") filter.isPublished = true;
    if (published === "false") filter.isPublished = false;
    if (category) filter.category = { $regex: category, $options: "i" };
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("-content")
        .populate("uploadedBy", "name email"),
      Article.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        articles,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getSingleArticle = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const article = await Article.findById(req.params.id).populate(
      "uploadedBy",
      "name email"
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { article },
    });
  } catch (error) {
    next(error);
  }
};

const getArticleBySlug = async (req, res, next) => {
  try {
    const article = await Article.findOne({
      slug: req.params.slug,
      isPublished: true,
    }).populate("uploadedBy", "name email");

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    await Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      data: { article },
    });
  } catch (error) {
    next(error);
  }
};

const createArticle = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { title, content, excerpt, author, category, tags, isPublished } =
      req.body;

    const articleData = {
      title,
      content,
      excerpt: excerpt || "",
      author: author || req.admin.name,
      category: category || "General",
      tags: parseTags(tags),
      isPublished: parseIsPublished(isPublished),
      uploadedBy: req.admin.id,
    };

    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        FOLDERS.ARTICLE_COVERS,
        [
          {
            width: 1200,
            height: 630,
            crop: "fill",
            quality: "auto",
            fetch_format: "auto",
          },
        ]
      );

      articleData.coverImage = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }

    const article = await Article.create(articleData);

    const populatedArticle = await Article.findById(article._id).populate(
      "uploadedBy",
      "name email"
    );

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      data: { article: populatedArticle },
    });
  } catch (error) {
    next(error);
  }
};

const updateArticle = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    const { title, content, excerpt, author, category, tags, isPublished } =
      req.body;

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (author !== undefined) updateData.author = author;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = parseTags(tags);
    if (isPublished !== undefined)
      updateData.isPublished = parseIsPublished(isPublished);

    if (req.file) {
      if (article.coverImage?.publicId) {
        await deleteFromCloudinary(article.coverImage.publicId, "image").catch(
          () => {}
        );
      }

      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        FOLDERS.ARTICLE_COVERS,
        [
          {
            width: 1200,
            height: 630,
            crop: "fill",
            quality: "auto",
            fetch_format: "auto",
          },
        ]
      );

      updateData.coverImage = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("uploadedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Article updated successfully",
      data: { article: updatedArticle },
    });
  } catch (error) {
    next(error);
  }
};

const deleteArticle = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    if (article.coverImage?.publicId) {
      await deleteFromCloudinary(article.coverImage.publicId, "image").catch(
        () => {}
      );
    }

    await Article.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getArticleStats = async (req, res, next) => {
  try {
    const [total, published, drafts] = await Promise.all([
      Article.countDocuments(),
      Article.countDocuments({ isPublished: true }),
      Article.countDocuments({ isPublished: false }),
    ]);

    res.status(200).json({
      success: true,
      data: { stats: { total, published, drafts } },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllArticles,
  getSingleArticle,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleStats,
};