const express = require("express");
const router = express.Router();

const { getStats } = require("../controllers/superAdminStats.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get("/", authMiddleware, roleMiddleware("super_admin"), getStats);

module.exports = router;