const express = require("express");
const router = express.Router();

const {
  listUsers,
  block,
  unblock,
} = require("../controllers/user.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get("/", authMiddleware, roleMiddleware("admin"), listUsers);

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