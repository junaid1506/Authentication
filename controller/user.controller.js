const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Session = require("../model/Session");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../config/generateTokens");

async function userRegister(req, res) {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email?.toLowerCase();

    if (!name || name.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 3 characters",
      });
    }
    if (!email || !/.+\@.+\..+/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }
    const userExist = await User.findOne({ email: normalizedEmail });

    if (userExist) {
      return res.status(409).json({
        success: false,
        message: "Account already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User create successfully",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function userLogin(req, res) {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email?.toLowerCase();
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    if (!/.+\@.+\..+/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const comparedPass = await bcrypt.compare(password, user.password);

    if (!comparedPass) {
      return res.status(401).json({
        success: false,
        message: "Email and password is not match",
      });
    }

    // const token = jwt.sign({ id: user._id }, "Junaid123", { expiresIn: "1h" });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await Session.create({
      user: user._id,
      refreshTokenHash,
      deviceIP: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await user.save();
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Login Successfully",
      userId: user._id,
      accessToken,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function userLogout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token not found",
      });
    }
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await Session.findOne({
      refreshTokenHash,
      revoked: false,
    });
    if (!session) {
      return res.status(400).json({
        success: false,
        message: "Session not found",
      });
    }
    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
}
async function userProfile(req, res) {
  return res.status(200).json({
    success: true,
    id: req.user.id,
  });
}

async function refreshToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized Token not found",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const acesstoken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      accessToken: acesstoken,
    });
  } catch (error) {
    console.error("TOKEN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  userRegister,
  userLogin,
  userProfile,
  userLogout,
  refreshToken,
};
