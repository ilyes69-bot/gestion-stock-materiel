const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload.middleware");

const {
  getMateriels,
  getMateriel,
  addMateriel,
  editMateriel,
  removeMateriel,
} = require("../controllers/materiel.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// Routes accessibles aux clients et admins
router.get("/", authMiddleware, getMateriels);
router.get("/:id", authMiddleware, getMateriel);

// Routes admin seulement
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("image"),
  addMateriel
);

router.put("/:id", authMiddleware, roleMiddleware("admin"), editMateriel);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), removeMateriel);

module.exports = router;