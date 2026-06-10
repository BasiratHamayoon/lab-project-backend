const express = require("express");
const {
  getAllArticles,
  getSingleArticle,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleStats,
} = require("../controllers/article.controller");
const { protect } = require("../middleware/auth.middleware");
const articleCoverUpload = require("../uploads/article.upload");
const {
  createArticleValidator,
  updateArticleValidator,
  articleIdValidator,
} = require("../validators/article.validator");

const router = express.Router();

router.get("/", getAllArticles);
router.get("/stats", protect, getArticleStats);
router.get("/slug/:slug", getArticleBySlug);
router.get("/:id", articleIdValidator, getSingleArticle);

router.post(
  "/",
  protect,
  articleCoverUpload.single("coverImage"),
  createArticleValidator,
  createArticle
);

router.put(
  "/:id",
  protect,
  articleCoverUpload.single("coverImage"),
  updateArticleValidator,
  updateArticle
);

router.delete("/:id", protect, articleIdValidator, deleteArticle);

module.exports = router;