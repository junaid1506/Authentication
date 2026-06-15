const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Session = require("../model/Session");
const { sendEmail } = require("../services/email.service");
const { generateOtp, getotpHtml } = require("../utils/utils");
const OTP = require("../model/Otp");

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
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    const otp = generateOtp();
    const otpHtml = getotpHtml(otp);
    const otphash = crypto.createHash("sha256").update(otp).digest("hex");

    // Save the OTP to the database
    await OTP.create({
      userId: user._id,
      email: user.email,
      otp: otphash,
    });
    await sendEmail(email, "Welcome to Our App", otpHtml);

    return res.status(201).json({
      success: true,
      message: "User create successfully",
      user: {
        userId: user._id,
        email: user.email,
        verified: user.verified,
      },
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
    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. Please check your inbox for the OTP.",
      });
    }
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
    const accessToken = generateAccessToken(user, session._id);
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
      error: error.message,
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

async function userLogoutAll(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token not found",
      });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }
    await Session.updateMany(
      { user: decoded.id, revoked: false },
      { revoked: true },
    );
    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    console.error("LOGOUT ALL ERROR:", error);
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
    if (!decoded || !decoded.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized Invalid token",
      });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized User not found",
      });
    }
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const session = await Session.findOne({
      user: decoded.id,
      refreshTokenHash,
      revoked: false,
    });
    if (!session) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized Session not found",
      });
    }

    const acesstoken = generateAccessToken(user, session._id);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");
    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    return res.status(200).json({
      success: true,
      accessToken: acesstoken,
    });
  } catch (error) {
    console.error("TOKEN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function verifyEmail(req, res) {
  try {
    const { otp, email } = req.body;

    if (!otp || !email) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp: otpHash,
    });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or email",
      });
    }
    console.log("OTP Record found:", otpRecord);
    console.log("OTP Record expires at:", otpRecord.userId);
    const user = await User.findByIdAndUpdate(
      otpRecord.userId,
      {
        verified: true,
      },
      { returnDocument: "after" },
    );
    console.log("User after update:", user);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    
    await OTP.deleteMany({ userId: otpRecord.userId });
    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
module.exports = {
  userRegister,
  userLogin,
  userProfile,
  userLogout,
  userLogoutAll,
  refreshToken,
  verifyEmail,
};
