const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
      error: error.message,
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

    const token = jwt.sign({ id: user._id }, "Junaid123", { expiresIn: "1h" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Login Successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
async function userLogout(req, res) {
  try {
    res.clearCookie("token");

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
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
module.exports = { userRegister, userLogin, userProfile, userLogout };
