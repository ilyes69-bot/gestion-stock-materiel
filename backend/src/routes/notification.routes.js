const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  readNotification,
} = require("../controllers/notification.controller");

const authMiddleware = require("../middlewares/auth.middleware");

router.get("/me", authMiddleware, getMyNotifications);
router.put("/:id/read", authMiddleware, readNotification);

module.exports = router;