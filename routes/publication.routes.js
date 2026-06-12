const express = require("express")
const {
  getAllPublications,
  getSinglePublication,
  createPublication,
  updatePublication,
  deletePublication,
  getPublicationStats,
} = require("../controllers/publication.controller")
const { protect } = require("../middleware/auth.middleware")
const {
  createPublicationValidator,
  updatePublicationValidator,
  publicationIdValidator,
} = require("../validators/publication.validator")

const router = express.Router()

router.get("/", getAllPublications)
router.get("/stats", protect, getPublicationStats)
router.get("/:id", publicationIdValidator, getSinglePublication)

router.post(
  "/",
  protect,
  createPublicationValidator,
  createPublication
)

router.put(
  "/:id",
  protect,
  updatePublicationValidator,
  updatePublication
)

router.delete("/:id", protect, publicationIdValidator, deletePublication)

module.exports = router