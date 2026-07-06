const express = require("express");
const router = express.Router();

const {
  getAll,
  create,
  block,
  unblock,
} = require("../controllers/societeWorker.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  getAll
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  create
);

router.put(
  "/:id/block",
  authMiddleware,
  roleMiddleware("admin"),
  block
);

router.put(
  "/:id/unblock",
  authMiddleware,
  roleMiddleware("admin"),
  unblock
);

module.exports = router;