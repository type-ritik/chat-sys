const {
  findUserByEmail,
  findUserById,
  userRecord,
  createLoginAttempt,
  blockUser,
  alterAvatar,
  updateProfile,
} = require("../utils/user.config");
const { comparePassword } = require("../utils/passKey");
const {
  genToken,
  genRefreshToken,
  verifyRefreshToken,
} = require("../utils/auth");
const cloudinary = require("../config/cloudinary");
const validator = require("../utils/validator");
const { GraphQLError } = require("graphql");

// User Login
async function loginUser(_, { email, password }, context) {
  try {
    // User input validation
    if (!validator.isEmail(email)) {
      console.log("Validation Error:", "Invalid email format");
      throw new Error("Validation Error:", "Invalid email format");
    }

    if (!validator.isStrongPassword(password)) {
      console.log(
        "Validation Error:",
        "Password does not meet strength requirements",
      );
      throw new Error(
        "Validation Error:",
        "Password does not meet strength requirements.",
      );
    }

    // Find User by Email
    const user = await findUserByEmail(email);

    // const now = new Date();

    const ipAddress = context.req.ip.replace("::ffff:", "");

    // const record = await isSuspiciousLogin(user.id);

    // if (
    //   record &&
    //   record.blocked_until &&
    //   now < new Date(record.blocked_until)
    // ) {
    //   console.log("User blocked. Try again later.");
    //   throw new Error("User blocked. Try again later.");
    // }

    // Match the password
    const isValidPass = await comparePassword(password, user.password);

    // If not matched, report "Incorrect password Error" message
    if (!isValidPass) {
      console.log("Validation Error:", "Not valid password");
      const updated = await createLoginAttempt(user.id, ipAddress);

      if (updated.attempts >= 50) {
        const msg = await blockUser(user.id);
        throw new Error(msg.error);
      } else {
        throw new Error("Invalid password");
      }
    }

    const token = genToken(user.id, user.isAdmin);

    if (!token) {
      throw new Error("Failed to generate access token");
    }

    const refreshToken = genRefreshToken(user.id, user.isAdmin);

    if (!refreshToken) {
      throw new Error("Failed to generate refresh token");
    }

    context.res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Makes the cookie inaccessible to client-side scripts
      secure: process.env.NODE_ENV === "production", // Ensure the cookie is sent over HTTPS in production
      sameSite: "none",
      // partitioned: true,
      maxAge: 60 * 60 * 1000, // Cookie expiration after 1hr
    });

    return { ...user, token };
  } catch (error) {
    console.log("Error login user", error.message);
    throw new Error(error.message);
  }
}

// Create User
async function createUser(_, { name, email, password }, context) {
  if (!validator.isAscii(name)) {
    console.log("Validation Error:", "Name should contain only letters");
    throw new Error("Validation Error:", "Name should contain only letters");
  }

  if (name.length < 3) {
    console.log(
      "Validation Error:",
      "Name should be at least 3 characters long",
    );
    throw new Error(
      "Validation Error:",
      "Name should be at least 3 character long",
    );
  }

  if (!validator.isEmail(email)) {
    console.log("Validation Error:", "Invalid email format");
    throw new Error("Validation Error:", "Invalid email format");
  }

  if (!validator.isStrongPassword(password)) {
    console.log("Validation Error:", "Please provide strong password");
    throw new Error("Validation Error:", "Please provide strong password");
  }

  try {
    const result = await userRecord(name, email, password);

    const token = genToken(result.id, result.isAdmin);

    if (!token) {
      throw new Error("Failed to generate access token");
    }

    const refreshToken = genRefreshToken(result.id, result.isAdmin);

    if (!refreshToken) {
      throw new Error("Failed to generate refresh token");
    }

    context.res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Makes the cookie inaccessible to client-side scripts
      secure: process.env.NODE_ENV === "production", // Ensure the cookie is sent over HTTPS in production
      sameSite: "none",
      // partitioned: true,
      maxAge: 60 * 60 * 1000, // Cookie expiration after 32 minutest
    });

    // 5. Return final response
    return {
      ...result,
      token,
    };
  } catch (error) {
    console.error(error.message);
    throw new Error(error); // return real error to client
  }
}

async function updateUserData(_, { name, username, bio }, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  try {
    const payload = await updateProfile(userId, name, username, bio);

    return payload;
  } catch (error) {
    console.log("Error updating userdata", error.message);
    throw new Error("Error updating userdata");
  }
}

async function updateAvatar(_, { file }, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  // console.log(file);
  try {
    const uploadedFile = await file;

    const { createReadStream } = uploadedFile;

    if (typeof createReadStream !== "function") {
      console.log("Invalid file upload");
      throw new Error("Invalid file upload");
    }

    if (!cloudinary || !cloudinary.uploader) {
      console.log("Cloudinary configuration error");
      throw new Error("Cloudinary configuration error");
    }
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "avatars",
        },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        },
      );
      createReadStream().pipe(uploadStream);
    });

    // console.log("Result: ", result);
    const payload = await alterAvatar(userId, result.secure_url);

    return payload;
  } catch (error) {
    console.log("Error updating avatar", error.message);
    throw new Error("Error updating avatar");
  }
}

async function userData(_, obj, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }
  try {
    const payload = findUserById(userId);

    return payload;
  } catch (error) {
    console.log("Error fetching user data", error);
    // throw new Error("[500 Server Error]:", error.message);
    throw new Error(error.message);
  }
}

async function createNewAccessToken(_, obj, context) {
  try {
    const refreshToken = context.req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new GraphQLError("Not authenticated", {
        extensions: { code: "UNAUTHORIZED" },
      });
    }

    const decoded = verifyRefreshToken(refreshToken);

    const userId = decoded.userId;
    const isAdmin = decoded.role;

    const newToken = genToken(userId, isAdmin);

    if (!newToken) {
      throw new Error("Failed to generate access token");
    }

    const newRefreshToken = genRefreshToken(userId, isAdmin);

    if (!newRefreshToken) {
      throw new Error("Failed to generate refresh token");
    }

    const user = await findUserById(userId);

    delete user.password;

    context.res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true, // Makes the cookie inaccessible to client-side scripts
      secure: process.env.NODE_ENV === "production", // Ensure the cookie is sent over HTTPS in production
      sameSite: "none",
      // partitioned: true,
      maxAge: 60 * 60 * 1000, // Cookie expiration after 1hr
    });

    return { token: newToken, user };
  } catch (error) {
    console.log("Error refreshing access token", error.message);
    throw new Error(error.message);
  }
}

module.exports = {
  loginUser,
  createUser,
  userData,
  updateUserData,
  updateAvatar,
  createNewAccessToken,
};
