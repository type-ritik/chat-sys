const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");

// Verify JWT and extract user info
function verifyToken(token) {
  if (!token) {
    throw new GraphQLError("Unauthorized", {
      extensions: {
        code: "UNAUTHORIZED",
      },
    });
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new GraphQLError("TokenExpired", {
        extensions: { code: "UNAUTHORIZED" },
      });
    }
  }
}

function verifyRefreshToken(token) {
  if (!token) {
    throw new GraphQLError("Unauthorized", {
      extensions: {
        code: "UNAUTHORIZED",
      },
    });
  }
  try {
    return jwt.verify(token, process.env.REFRESH_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new GraphQLError("TokenExpired", {
        extensions: { code: "UNAUTHORIZED" },
      });
    }
  }
}

function genToken(userId, admin) {
  return jwt.sign(
    {
      userId,
      role: admin,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
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
      { expiresIn: "7d" },
    );
  } catch (ekrror) {
    console.error("Error generating refresh token:", error);
    throw new Error("Failed to generate refresh token");
  }
}

module.exports = { verifyToken, genToken, genRefreshToken, verifyRefreshToken };
