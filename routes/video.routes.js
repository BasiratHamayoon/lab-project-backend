const express = require("express");
const {
  getAllVideos,
  getSingleVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideoStats,
} = require("../controllers/video.controller");
const { protect } = require("../middleware/auth.middleware");
const videoThumbnailUpload = require("../uploads/video.upload");
const {
  createVideoValidator,
  updateVideoValidator,
  videoIdValidator,
} = require("../validators/video.validator");

const router = express.Router();

router.get("/", getAllVideos);
router.get("/stats", protect, getVideoStats);
router.get("/:id", videoIdValidator, getSingleVideo);

router.post(
  "/",
  protect,
  videoThumbnailUpload.single("thumbnail"),
  createVideoValidator,
  createVideo
);

router.put(
  "/:id",
  protect,
  videoThumbnailUpload.single("thumbnail"),
  updateVideoValidator,
  updateVideo
);

router.delete("/:id", protect, videoIdValidator, deleteVideo);

module.exports = router;