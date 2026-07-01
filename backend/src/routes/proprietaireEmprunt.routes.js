const express = require("express");
const router = express.Router();

const {
  getReceived,
  accept,
  refuse,
  confirmHandover,
  confirmReturnNormal,
  confirmReturnProblem,
} = require("../controllers/proprietaireEmprunt.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get(
  "/received",
  authMiddleware,
  roleMiddleware("client"),
  getReceived
);

router.put(
  "/:id/accept",
  authMiddleware,
  roleMiddleware("client"),
  accept
);

router.put(
  "/:id/refuse",
  authMiddleware,
  roleMiddleware("client"),
  refuse
);

router.put(
  "/:id/handover",
  authMiddleware,
  roleMiddleware("client"),
  confirmHandover
);

router.put(
  "/:id/return-normal",
  authMiddleware,
  roleMiddleware("client"),
  confirmReturnNormal
);

router.put(
  "/:id/return-problem",
  authMiddleware,
  roleMiddleware("client"),
  confirmReturnProblem
);

module.exports = router;