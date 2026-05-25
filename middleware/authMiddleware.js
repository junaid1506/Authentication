const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) { 
      return res.status(401).json({ 
        success: false,
        message: "No token provided", 
      });
    }

    const decoded = jwt.verify(token, "Junaid123");
    req.user = decoded; 

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired",
      });
    }

    return res.status(401).json({ 
      success: false,
      message: "Invalid token",
    });
  }
}

module.exports = authMiddleware;
