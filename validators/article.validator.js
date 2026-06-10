const { body, param } = require("express-validator");

const createArticleValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 300 })
    .withMessage("Title must be between 3 and 300 characters")
    .trim(),

  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 50 })
    .withMessage("Content must be at least 50 characters"),

  body("excerpt")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Excerpt cannot exceed 500 characters")
    .trim(),

  body("author")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Author name must be between 2 and 100 characters")
    .trim(),

  body("category")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Category cannot exceed 100 characters")
    .trim(),

  body("tags")
    .optional()
    .custom((value) => {
      if (typeof value === "string" || Array.isArray(value)) return true;
      throw new Error("Tags must be a string or array");
    }),

  body("isPublished")
    .optional()
    .custom((value) => {
      if (
        value === "true" ||
        value === "false" ||
        value === true ||
        value === false
      ) {
        return true;
      }
      throw new Error("isPublished must be a boolean value");
    }),
];

const updateArticleValidator = [
  param("id").isMongoId().withMessage("Invalid article ID format"),

  body("title")
    .optional()
    .isLength({ min: 3, max: 300 })
    .withMessage("Title must be between 3 and 300 characters")
    .trim(),

  body("content")
    .optional()
    .isLength({ min: 50 })
    .withMessage("Content must be at least 50 characters"),

  body("excerpt")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Excerpt cannot exceed 500 characters")
    .trim(),

  body("author")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Author name must be between 2 and 100 characters")
    .trim(),

  body("category")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Category cannot exceed 100 characters")
    .trim(),

  body("tags")
    .optional()
    .custom((value) => {
      if (typeof value === "string" || Array.isArray(value)) return true;
      throw new Error("Tags must be a string or array");
    }),

  body("isPublished")
    .optional()
    .custom((value) => {
      if (
        value === "true" ||
        value === "false" ||
        value === true ||
        value === false
      ) {
        return true;
      }
      throw new Error("isPublished must be a boolean value");
    }),
];

const articleIdValidator = [
  param("id").isMongoId().withMessage("Invalid article ID format"),
];

module.exports = {
  createArticleValidator,
  updateArticleValidator,
  articleIdValidator,
};