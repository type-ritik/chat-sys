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

function verifyRefreshToken(token) {
  if (!token) {
    throw new Error("Unauthorized");
  }
  try {
    return jwt.verify(token, process.env.REFRESH_SECRET);
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
    process.env.JWT_SECRET,
    { expiresIn: "30min" },
  );
}

function genRefreshToken(userId, admin) {
  try {
    return jwt.sign(
      {
        userId,
        role: admin,
      },
      process.env.REFRESH_SECRET,
      { expiresIn: "32min" },
    );
  } catch (error) {
    console.error("Error generating refresh token:", error);
    throw new Error("Failed to generate refresh token");
  }
}

module.exports = { verifyToken, genToken, genRefreshToken, verifyRefreshToken };
