const express = require("express");
const router = express.Router();

const {
  create,
  getMine,
  getAll,
  validerDemande,
  refuserDemande,
  confirmerRetourNormal,
  confirmerRetourEndommage,
} = require("../controllers/emprunt.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// Client : créer une demande d'emprunt
router.post(
  "/",
  authMiddleware,
  roleMiddleware("client"),
  create
);

// Client : voir ses emprunts
router.get(
  "/me",
  authMiddleware,
  roleMiddleware("client"),
  getMine
);

// Admin société : voir tous les emprunts
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  getAll
);

// Admin société : valider une demande société
router.put(
  "/:id/valider-demande",
  authMiddleware,
  roleMiddleware("admin"),
  validerDemande
);

// Admin société : refuser une demande société
router.put(
  "/:id/refuser-demande",
  authMiddleware,
  roleMiddleware("admin"),
  refuserDemande
);

// Admin société : confirmer retour normal final
router.put(
  "/:id/confirmer-retour-normal",
  authMiddleware,
  roleMiddleware("admin"),
  confirmerRetourNormal
);

// Admin société : confirmer retour avec problème
router.put(
  "/:id/confirmer-retour-endommage",
  authMiddleware,
  roleMiddleware("admin"),
  confirmerRetourEndommage
);

/*
  Anciennes routes gardées pour éviter de casser le frontend
*/

router.put(
  "/:id/validate-return",
  authMiddleware,
  roleMiddleware("admin"),
  confirmerRetourNormal
);

router.put(
  "/:id/mark-damaged",
  authMiddleware,
  roleMiddleware("admin"),
  confirmerRetourEndommage
);

router.put(
  "/:id/valider-retour",
  authMiddleware,
  roleMiddleware("admin"),
  confirmerRetourNormal
);

router.put(
  "/:id/signaler-endommage",
  authMiddleware,
  roleMiddleware("admin"),
  confirmerRetourEndommage
);

module.exports = router;