const express = require("express");
const router = express.Router();

const { getStats } = require("../controllers/dashboard.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get("/stats", authMiddleware, roleMiddleware("admin"), getStats);

module.exports = router;