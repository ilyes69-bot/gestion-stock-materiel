const express = require("express");
const router = express.Router();

const {
  scanMateriel,
  confirmSortie,
  retourNormal,
  retourProbleme,
  getEmprunts,
} = require("../controllers/worker.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get(
  "/emprunts",
  authMiddleware,
  roleMiddleware("travailleur"),
  getEmprunts
);

router.get(
  "/scan/:qrToken",
  authMiddleware,
  roleMiddleware("travailleur"),
  scanMateriel
);

router.put(
  "/emprunts/:id/confirmer-sortie",
  authMiddleware,
  roleMiddleware("travailleur"),
  confirmSortie
);

router.put(
  "/emprunts/:id/retour-normal",
  authMiddleware,
  roleMiddleware("travailleur"),
  retourNormal
);

router.put(
  "/emprunts/:id/retour-probleme",
  authMiddleware,
  roleMiddleware("travailleur"),
  retourProbleme
);

module.exports = router;