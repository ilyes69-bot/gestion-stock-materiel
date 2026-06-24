const express = require("express");
const {
  register,
  login,
  me,
  verify,
  forgotPassword,
  resetPasswordController,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);

router.get("/verify-email/:token", verify);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPasswordController);

module.exports = router;