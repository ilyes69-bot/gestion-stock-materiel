const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  blockUser,
  unblockUser,
} = require("../controllers/superAdminUser.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get("/", authMiddleware, roleMiddleware("super_admin"), getAllUsers);

router.put("/:id/block", authMiddleware, roleMiddleware("super_admin"), blockUser);

router.put(
  "/:id/unblock",
  authMiddleware,
  roleMiddleware("super_admin"),
  unblockUser
);

module.exports = router;