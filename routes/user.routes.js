const express = require("express");
const router = express.Router();

const {
  userRegister,
  userLogin,
  userProfile,
  userLogout,
} = require("../controller/user.controller");
const authMiddleware = require("../middleware/authMiddleware");
const limiter = require("../middleware/rateLimiter");

router.post("/user/register", userRegister);
router.post("/user/login", limiter, userLogin);
router.post("/user/logout", authMiddleware, userLogout);

router.get("/user/profile", authMiddleware, userProfile);

module.exports = router;
