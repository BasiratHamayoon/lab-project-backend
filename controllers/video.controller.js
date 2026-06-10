const { validationResult } = require("express-validator");
const Video = require("../models/Video.model");
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

const getAllVideos = async (req, res, next) => {
  try {
    const { published, category, page = 1, limit = 20, search } = req.query;

    const filter = {};

    if (published === "true") filter.isPublished = true;
    if (published === "false") filter.isPublished = false;
    if (category) filter.category = { $regex: category, $options: "i" };
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);

    const [videos, total] = await Promise.all([
      Video.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("uploadedBy", "name email"),
      Video.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        videos,
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

const getSingleVideo = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const video = await Video.findById(req.params.id).populate(
      "uploadedBy",
      "name email"
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { video },
    });
  } catch (error) {
    next(error);
  }
};

const createVideo = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { title, description, videoUrl, category, isPublished } = req.body;

    const videoData = {
      title,
      description,
      videoUrl,
      category: category || "General",
      isPublished: parseIsPublished(isPublished),
      uploadedBy: req.admin.id,
    };

    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        FOLDERS.VIDEO_THUMBNAILS,
        [
          {
            width: 1280,
            height: 720,
            crop: "fill",
            quality: "auto",
            fetch_format: "auto",
          },
        ]
      );

      videoData.thumbnail = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }

    const video = await Video.create(videoData);

    const populatedVideo = await Video.findById(video._id).populate(
      "uploadedBy",
      "name email"
    );

    res.status(201).json({
      success: true,
      message: "Video created successfully",
      data: { video: populatedVideo },
    });
  } catch (error) {
    next(error);
  }
};

const updateVideo = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    const { title, description, videoUrl, category, isPublished } = req.body;

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (category !== undefined) updateData.category = category;
    if (isPublished !== undefined)
      updateData.isPublished = parseIsPublished(isPublished);

    if (req.file) {
      if (video.thumbnail?.publicId) {
        await deleteFromCloudinary(video.thumbnail.publicId, "image").catch(
          () => {}
        );
      }

      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        FOLDERS.VIDEO_THUMBNAILS,
        [
          {
            width: 1280,
            height: 720,
            crop: "fill",
            quality: "auto",
            fetch_format: "auto",
          },
        ]
      );

      updateData.thumbnail = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("uploadedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Video updated successfully",
      data: { video: updatedVideo },
    });
  } catch (error) {
    next(error);
  }
};

const deleteVideo = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    if (video.thumbnail?.publicId) {
      await deleteFromCloudinary(video.thumbnail.publicId, "image").catch(
        () => {}
      );
    }

    await Video.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getVideoStats = async (req, res, next) => {
  try {
    const [total, published, drafts] = await Promise.all([
      Video.countDocuments(),
      Video.countDocuments({ isPublished: true }),
      Video.countDocuments({ isPublished: false }),
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
  getAllVideos,
  getSingleVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideoStats,
};