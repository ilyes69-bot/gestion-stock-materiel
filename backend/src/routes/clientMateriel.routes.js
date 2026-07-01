const express = require("express");
const router = express.Router();

const {
  create,
  getMine,
  getPending,
  approve,
  refuse,
  getCatalogue,
} = require("../controllers/clientMateriel.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("client"),
  upload.single("image"),
  create
);

router.get(
  "/me",
  authMiddleware,
  roleMiddleware("client"),
  getMine
);

router.get(
  "/super-admin/pending",
  authMiddleware,
  roleMiddleware("super_admin"),
  getPending
);

router.get(
  "/catalogue",
  authMiddleware,
  roleMiddleware("client"),
  getCatalogue
);

router.put(
  "/super-admin/:id/approve",
  authMiddleware,
  roleMiddleware("super_admin"),
  approve
);

router.put(
  "/super-admin/:id/refuse",
  authMiddleware,
  roleMiddleware("super_admin"),
  refuse
);

module.exports = router;