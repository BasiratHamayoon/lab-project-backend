const mongoose = require("mongoose")
const slugify = require("slugify")

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
      default: "",
    },
    coverImage: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    author: {
      type: String,
      trim: true,
      default: "Admin",
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
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

articleSchema.index({ title: "text", content: "text", excerpt: "text" })
articleSchema.index({ isPublished: 1, createdAt: -1 })
articleSchema.index({ slug: 1 })
articleSchema.index({ category: 1 })

articleSchema.pre("save", async function () {
  if (!this.isModified("title")) return

  let baseSlug = slugify(this.title, { lower: true, strict: true })
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await mongoose
      .model("Article")
      .findOne({ slug, _id: { $ne: this._id } })
    if (!existing) break
    slug = `${baseSlug}-${counter}`
    counter++
  }

  this.slug = slug
})

articleSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate()
  if (!update.title && !update.$set?.title) return

  const title = update.title || update.$set?.title
  let baseSlug = slugify(title, { lower: true, strict: true })
  let slug = baseSlug
  let counter = 1
  const docId = this.getQuery()._id

  while (true) {
    const existing = await mongoose
      .model("Article")
      .findOne({ slug, _id: { $ne: docId } })
    if (!existing) break
    slug = `${baseSlug}-${counter}`
    counter++
  }

  if (update.$set) {
    update.$set.slug = slug
  } else {
    update.slug = slug
  }
})

module.exports = mongoose.model("Article", articleSchema)