const express = require("express");
const {
  register,
  login,
  verifyToken,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/auth.controller");
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} = require("../validators/auth.validator");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.get("/verify", verifyToken);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfileValidator, updateProfile);
router.put("/change-password", protect, changePasswordValidator, changePassword);

module.exports = router;