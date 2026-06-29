const express = require("express");
const router = express.Router();

const {
  create,
  getMine,
  getAll,
  validate,
  damage,
} = require("../controllers/emprunt.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.post("/", authMiddleware, roleMiddleware("client"), create);

router.get("/me", authMiddleware, roleMiddleware("client"), getMine);

router.get("/", authMiddleware, roleMiddleware("admin"), getAll);

router.put("/:id/retour-valide", authMiddleware, roleMiddleware("admin"), validate);

router.put("/:id/endommage", authMiddleware, roleMiddleware("admin"), damage);

module.exports = router;