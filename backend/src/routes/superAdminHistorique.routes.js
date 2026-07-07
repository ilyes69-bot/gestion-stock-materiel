const express = require("express");
const router = express.Router();

const {
  getHistoriqueGlobal,
} = require("../controllers/superAdminHistorique.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get(
  "/",
  authMiddleware,
  roleMiddleware("super_admin"),
  getHistoriqueGlobal
);

module.exports = router;