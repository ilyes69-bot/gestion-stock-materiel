const express = require("express");
const router = express.Router();

const {
  addEmprunt,
  getMesEmprunts,
  getEmpruntsAdmin,
  validerRetourMateriel,
  signalerEndommage,
} = require("../controllers/emprunt.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// Client
router.post("/", authMiddleware, roleMiddleware("client"), addEmprunt);
router.get("/me", authMiddleware, roleMiddleware("client"), getMesEmprunts);

// Admin
router.get("/", authMiddleware, roleMiddleware("admin"), getEmpruntsAdmin);
router.put("/:id/retour-valide", authMiddleware, roleMiddleware("admin"), validerRetourMateriel);
router.put("/:id/endommage", authMiddleware, roleMiddleware("admin"), signalerEndommage);

module.exports = router;