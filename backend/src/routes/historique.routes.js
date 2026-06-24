const express = require("express");
const router = express.Router();

const {
  getHistoriqueAdmin,
  getMonHistorique,
} = require("../controllers/historique.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get("/", authMiddleware, roleMiddleware("admin"), getHistoriqueAdmin);
router.get("/me", authMiddleware, getMonHistorique);

module.exports = router;