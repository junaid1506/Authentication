const express = require("express");
const router = express.Router();

const {
  userRegister,
  userLogin,
  userProfile,
  userLogout,
  userLogoutAll,
  refreshToken,
  verifyEmail
} = require("../controller/user.controller");
const authMiddleware = require("../middleware/authMiddleware");
const limiter = require("../middleware/rateLimiter");

router.post("/user/register", userRegister);
router.post("/user/login", limiter, userLogin);
router.post("/user/logout", authMiddleware, userLogout);
router.post("/user/logout-all", authMiddleware, userLogoutAll);

router.get("/user/profile", authMiddleware, userProfile);

router.post("/refresh-token", refreshToken);

router.post("/user/verify", verifyEmail);

module.exports = router;
