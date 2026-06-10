const { body, param } = require("express-validator");

const createVideoValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters")
    .trim(),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters")
    .trim(),

  body("videoUrl")
    .notEmpty()
    .withMessage("Video URL is required")
    .isURL()
    .withMessage("Please provide a valid video URL"),

  body("category")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Category cannot exceed 100 characters")
    .trim(),

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

const updateVideoValidator = [
  param("id").isMongoId().withMessage("Invalid video ID format"),

  body("title")
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters")
    .trim(),

  body("description")
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters")
    .trim(),

  body("videoUrl")
    .optional()
    .isURL()
    .withMessage("Please provide a valid video URL"),

  body("category")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Category cannot exceed 100 characters")
    .trim(),

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

const videoIdValidator = [
  param("id").isMongoId().withMessage("Invalid video ID format"),
];

module.exports = {
  createVideoValidator,
  updateVideoValidator,
  videoIdValidator,
};