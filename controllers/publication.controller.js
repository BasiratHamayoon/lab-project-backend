const { validationResult } = require("express-validator")
const Publication = require("../models/Publication.model")

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
    })
  }
  return null
}

const parseIsPublished = (value) => {
  if (value === "true" || value === true) return true
  if (value === "false" || value === false) return false
  return true
}

const parseTags = (tags) => {
  if (!tags) return []
  if (Array.isArray(tags)) return tags.map((t) => t.trim()).filter(Boolean)
  if (typeof tags === "string") return tags.split(",").map((t) => t.trim()).filter(Boolean)
  return []
}

const getAllPublications = async (req, res, next) => {
  try {
    const { published, category, year, page = 1, limit = 20, search } = req.query
    const filter = {}
    if (published === "true") filter.isPublished = true
    if (published === "false") filter.isPublished = false
    if (category) filter.category = { $regex: category, $options: "i" }
    if (year) filter.year = year
    if (search) filter.$text = { $search: search }
    const skip = (Number(page) - 1) * Number(limit)
    const [publications, total] = await Promise.all([
      Publication.find(filter)
        .sort({ year: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("uploadedBy", "name email"),
      Publication.countDocuments(filter),
    ])
    res.status(200).json({
      success: true,
      data: {
        publications,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

const getSinglePublication = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res)
    if (validationError) return
    const publication = await Publication.findById(req.params.id).populate("uploadedBy", "name email")
    if (!publication) {
      return res.status(404).json({ success: false, message: "Publication not found" })
    }
    res.status(200).json({ success: true, data: { publication } })
  } catch (error) {
    next(error)
  }
}

const createPublication = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res)
    if (validationError) return
    const {
      title, authors, journal, year, month, volume, issue,
      pages, doi, paperUrl, abstract, category, tags, isPublished,
    } = req.body
    const publicationData = {
      title,
      authors,
      journal,
      year,
      month: month || "",
      volume: volume || "",
      issue: issue || "",
      pages: pages || "",
      doi: doi || "",
      paperUrl: paperUrl || "",
      abstract: abstract || "",
      category: category || "Research Article",
      tags: parseTags(tags),
      isPublished: parseIsPublished(isPublished),
      uploadedBy: req.admin.id,
    }
    const publication = await Publication.create(publicationData)
    const populated = await Publication.findById(publication._id).populate("uploadedBy", "name email")
    res.status(201).json({
      success: true,
      message: "Publication created successfully",
      data: { publication: populated },
    })
  } catch (error) {
    next(error)
  }
}

const updatePublication = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res)
    if (validationError) return
    const publication = await Publication.findById(req.params.id)
    if (!publication) {
      return res.status(404).json({ success: false, message: "Publication not found" })
    }
    const {
      title, authors, journal, year, month, volume, issue,
      pages, doi, paperUrl, abstract, category, tags, isPublished,
    } = req.body
    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (authors !== undefined) updateData.authors = authors
    if (journal !== undefined) updateData.journal = journal
    if (year !== undefined) updateData.year = year
    if (month !== undefined) updateData.month = month
    if (volume !== undefined) updateData.volume = volume
    if (issue !== undefined) updateData.issue = issue
    if (pages !== undefined) updateData.pages = pages
    if (doi !== undefined) updateData.doi = doi
    if (paperUrl !== undefined) updateData.paperUrl = paperUrl
    if (abstract !== undefined) updateData.abstract = abstract
    if (category !== undefined) updateData.category = category
    if (tags !== undefined) updateData.tags = parseTags(tags)
    if (isPublished !== undefined) updateData.isPublished = parseIsPublished(isPublished)
    const updated = await Publication.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("uploadedBy", "name email")
    res.status(200).json({
      success: true,
      message: "Publication updated successfully",
      data: { publication: updated },
    })
  } catch (error) {
    next(error)
  }
}

const deletePublication = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res)
    if (validationError) return
    const publication = await Publication.findById(req.params.id)
    if (!publication) {
      return res.status(404).json({ success: false, message: "Publication not found" })
    }
    await Publication.findByIdAndDelete(req.params.id)
    res.status(200).json({ success: true, message: "Publication deleted successfully" })
  } catch (error) {
    next(error)
  }
}

const getPublicationStats = async (req, res, next) => {
  try {
    const [total, published, drafts, byYear, byCategory] = await Promise.all([
      Publication.countDocuments(),
      Publication.countDocuments({ isPublished: true }),
      Publication.countDocuments({ isPublished: false }),
      Publication.aggregate([{ $group: { _id: "$year", count: { $sum: 1 } } }, { $sort: { _id: -1 } }]),
      Publication.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    ])
    res.status(200).json({
      success: true,
      data: { stats: { total, published, drafts, byYear, byCategory } },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAllPublications,
  getSinglePublication,
  createPublication,
  updatePublication,
  deletePublication,
  getPublicationStats,
}