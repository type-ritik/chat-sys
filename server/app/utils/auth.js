const jwt = require("jsonwebtoken");

// Verify JWT and extract user info
function verifyToken(token) {
  if (!token) {
    throw new Error("Unauthorized");
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error("Invalid token");
  }
}

module.exports = { verifyToken };
