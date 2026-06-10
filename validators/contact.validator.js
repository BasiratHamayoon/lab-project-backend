const { body, param } = require("express-validator");

const createContactValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("subject")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Subject cannot exceed 200 characters")
    .trim(),

  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 10, max: 3000 })
    .withMessage("Message must be between 10 and 3000 characters")
    .trim(),
];

const contactIdValidator = [
  param("id").isMongoId().withMessage("Invalid contact ID format"),
];

module.exports = { createContactValidator, contactIdValidator };