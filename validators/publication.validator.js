const { body, param } = require("express-validator")

const createPublicationValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 500 })
    .withMessage("Title must be between 5 and 500 characters")
    .trim(),

  body("authors")
    .notEmpty()
    .withMessage("Authors are required")
    .isLength({ min: 3, max: 500 })
    .withMessage("Authors must be between 3 and 500 characters")
    .trim(),

  body("journal")
    .notEmpty()
    .withMessage("Journal name is required")
    .isLength({ min: 2, max: 300 })
    .withMessage("Journal must be between 2 and 300 characters")
    .trim(),

  body("year")
    .notEmpty()
    .withMessage("Year is required")
    .trim(),

  body("month")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Month cannot exceed 50 characters")
    .trim(),

  body("volume")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Volume cannot exceed 50 characters")
    .trim(),

  body("issue")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Issue cannot exceed 50 characters")
    .trim(),

  body("pages")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Pages cannot exceed 50 characters")
    .trim(),

  body("doi")
    .optional()
    .isLength({ max: 200 })
    .withMessage("DOI cannot exceed 200 characters")
    .trim(),

  body("paperUrl")
    .optional()
    .trim(),

  body("abstract")
    .optional()
    .isLength({ max: 3000 })
    .withMessage("Abstract cannot exceed 3000 characters")
    .trim(),

  body("category")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Category cannot exceed 100 characters")
    .trim(),

  body("tags")
    .optional()
    .custom((value) => {
      if (typeof value === "string" || Array.isArray(value)) return true
      throw new Error("Tags must be a string or array")
    }),

  body("isPublished")
    .optional()
    .custom((value) => {
      if (value === "true" || value === "false" || value === true || value === false) return true
      throw new Error("isPublished must be a boolean value")
    }),
]

const updatePublicationValidator = [
  param("id").isMongoId().withMessage("Invalid publication ID format"),

  body("title")
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage("Title must be between 5 and 500 characters")
    .trim(),

  body("authors")
    .optional()
    .isLength({ min: 3, max: 500 })
    .withMessage("Authors must be between 3 and 500 characters")
    .trim(),

  body("journal")
    .optional()
    .isLength({ min: 2, max: 300 })
    .withMessage("Journal must be between 2 and 300 characters")
    .trim(),

  body("year")
    .optional()
    .trim(),

  body("month")
    .optional()
    .isLength({ max: 50 })
    .trim(),

  body("volume")
    .optional()
    .isLength({ max: 50 })
    .trim(),

  body("issue")
    .optional()
    .isLength({ max: 50 })
    .trim(),

  body("pages")
    .optional()
    .isLength({ max: 50 })
    .trim(),

  body("doi")
    .optional()
    .isLength({ max: 200 })
    .trim(),

  body("paperUrl")
    .optional()
    .trim(),

  body("abstract")
    .optional()
    .isLength({ max: 3000 })
    .trim(),

  body("category")
    .optional()
    .isLength({ max: 100 })
    .trim(),

  body("tags")
    .optional()
    .custom((value) => {
      if (typeof value === "string" || Array.isArray(value)) return true
      throw new Error("Tags must be a string or array")
    }),

  body("isPublished")
    .optional()
    .custom((value) => {
      if (value === "true" || value === "false" || value === true || value === false) return true
      throw new Error("isPublished must be a boolean value")
    }),
]

const publicationIdValidator = [
  param("id").isMongoId().withMessage("Invalid publication ID format"),
]

module.exports = {
  createPublicationValidator,
  updatePublicationValidator,
  publicationIdValidator,
}