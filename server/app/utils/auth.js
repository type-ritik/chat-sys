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

function genToken(userId, admin) {
  return jwt.sign(
    {
      userId,
      role: admin,
    },
    process.env.JWT_SECRET
  );
}

module.exports = { verifyToken, genToken };
