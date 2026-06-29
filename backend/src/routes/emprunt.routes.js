const express = require("express");
const router = express.Router();

const {
  create,
  getMine,
  getAll,
  validate,
  damage,
  validerDemande,
  refuserDemande,
  confirmerRetourNormal,
  confirmerRetourEndommage,
} = require("../controllers/emprunt.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.post("/", authMiddleware, roleMiddleware("client"), create);

router.get("/me", authMiddleware, roleMiddleware("client"), getMine);

router.get("/", authMiddleware, roleMiddleware("admin"), getAll);
router.put(
  "/:id/valider-demande",
  authMiddleware,
  roleMiddleware("admin"),
  validerDemande
);

router.put(
  "/:id/refuser-demande",
  authMiddleware,
  roleMiddleware("admin"),
  refuserDemande
);

router.put(
  "/:id/confirmer-retour-normal",
  authMiddleware,
  roleMiddleware("admin"),
  confirmerRetourNormal
);

router.put(
  "/:id/confirmer-retour-endommage",
  authMiddleware,
  roleMiddleware("admin"),
  confirmerRetourEndommage
);


router.put("/:id/retour-valide", authMiddleware, roleMiddleware("admin"), validate);

router.put("/:id/endommage", authMiddleware, roleMiddleware("admin"), damage);

module.exports = router;