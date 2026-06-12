const mongoose = require("mongoose")

const publicationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [500, "Title cannot exceed 500 characters"],
    },
    authors: {
      type: String,
      required: [true, "Authors are required"],
      trim: true,
    },
    journal: {
      type: String,
      required: [true, "Journal name is required"],
      trim: true,
    },
    year: {
      type: String,
      required: [true, "Year is required"],
      trim: true,
    },
    month: {
      type: String,
      trim: true,
      default: "",
    },
    volume: {
      type: String,
      trim: true,
      default: "",
    },
    issue: {
      type: String,
      trim: true,
      default: "",
    },
    pages: {
      type: String,
      trim: true,
      default: "",
    },
    doi: {
      type: String,
      trim: true,
      default: "",
    },
    paperUrl: {
      type: String,
      trim: true,
      default: "",
    },
    abstract: {
      type: String,
      trim: true,
      default: "",
      maxlength: [3000, "Abstract cannot exceed 3000 characters"],
    },
    category: {
      type: String,
      trim: true,
      default: "Research Article",
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

publicationSchema.index({ title: "text", authors: "text", abstract: "text" })
publicationSchema.index({ isPublished: 1, createdAt: -1 })
publicationSchema.index({ category: 1 })
publicationSchema.index({ year: -1 })

module.exports = mongoose.model("Publication", publicationSchema)