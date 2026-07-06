const express = require("express");
const router = express.Router();

const {
  requestSociete,
  getAll,
  getPending,
  approve,
  refuse,
  publicRequestSociete,
} = require("../controllers/societe.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.post("/public-request", publicRequestSociete);

router.post(
  "/request",
  authMiddleware,
  roleMiddleware("client"),
  requestSociete
);

router.get(
  "/super-admin/all",
  authMiddleware,
  roleMiddleware("super_admin"),
  getAll
);

router.get(
  "/super-admin/pending",
  authMiddleware,
  roleMiddleware("super_admin"),
  getPending
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