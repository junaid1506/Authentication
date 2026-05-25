const express = require("express");
const router = express.Router();

const {
  userRegister,
  userLogin,
  userProfile,
  userLogout,
} = require("../controller/user.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/user/register", userRegister);
router.post("/user/login", userLogin);
router.post("/user/logout", userLogout);

router.get("/user/profile", authMiddleware, userProfile);

module.exports = router;
