const express = require("express");
const {
  getAllContacts,
  getSingleContact,
  createContact,
  markAsRead,
  markAsUnread,
  deleteContact,
  getContactStats,
} = require("../controllers/contact.controller");
const { protect } = require("../middleware/auth.middleware");
const {
  createContactValidator,
  contactIdValidator,
} = require("../validators/contact.validator");

const router = express.Router();

router.post("/", createContactValidator, createContact);

router.get("/", protect, getAllContacts);
router.get("/stats", protect, getContactStats);
router.get("/:id", protect, contactIdValidator, getSingleContact);
router.put("/:id/read", protect, contactIdValidator, markAsRead);
router.put("/:id/unread", protect, contactIdValidator, markAsUnread);
router.delete("/:id", protect, contactIdValidator, deleteContact);

module.exports = router;