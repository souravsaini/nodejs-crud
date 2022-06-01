const express = require("express");
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = require("../controllers/userController");
const {
  signup,
  login,
  isAuth,
  isAllowed,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.patch("/updateme", isAuth, updateMe);
router.delete("/deleteme", isAuth, deleteMe);

router.route("/").get(isAuth, getAllUsers);
router
  .route("/:id")
  .get(isAuth, isAllowed("staff, admin"), getUser)
  .patch(isAuth, isAllowed("staff", "admin"), updateUser)
  .delete(isAuth, isAllowed("staff", "admin"), deleteUser);

module.exports = router;
