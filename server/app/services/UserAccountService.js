const {
  validateAuthInput,
  findUserByEmail,
  findUserById,
  userRecord,
  updateProifle,
  createLoginAttempt,
  blockUser,
  alterAvatar,
  isSuspiciousLogin,
  isSuspended,
} = require("../utils/user.config");
const { comparePassword } = require("../utils/passKey");
const {
  genToken,
  genRefreshToken,
  verifyRefreshToken,
} = require("../utils/auth");
const cloudinary = require("../config/cloudinary");

// User Login
async function loginUser(_, { email, password }, context) {
  try {
    // User input validation
    const validationErrors = validateAuthInput(email, password);

    // If not valid, report "Validation Error" message
    if (validationErrors.length > 0) {
      console.log("Validation Error", validationErrors);
      throw new Error(validationErrors);
    }

    // Find User by Email
    const user = await findUserByEmail(email);

    if (!user) {
      console.log("Validation Error:", "User not found");
      throw new Error("User not found");
    }

    if (user.status !== "ACTIVE") {
      console.log("Validation Error:", "User account is not active");
      throw new Error("User account is not active, Please contact support.");
    }

    const now = new Date();

    const ipAddress = context.req.ip.replace("::ffff:", "");

    const record = await isSuspiciousLogin(user.id);

    if (
      record &&
      record.blocked_until &&
      now < new Date(record.blocked_until)
    ) {
      console.log("User blocked. Try again later.");
      throw new Error("User blocked. Try again later.");
    }

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
      maxAge: 32 * 60 * 1000, // Cookie expiration after 32 minutest
    });

    return { ...user, token };
  } catch (error) {
    console.log("Error login user", error.message);

    throw new Error(error.message);
  }
}

// Create User
async function createUser(_, { name, email, password }, context) {
  try {
    // 1. Input validation
    const validationErrors = validateAuthInput(email, password);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(", "));
    }

    console.log("Input validation passed");

    // 2. Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    console.log("User does not exist, creating new user...");

    // 3. Create new user
    const result = await userRecord(name, email, password);

    if (result.error) {
      throw new Error(result.error);
    }

    const user = result.user; // extract user object

    if (!user) {
      throw new Error("User creation failed");
    }

    // console.log("User created successfully:", user.email);

    // 4. Generate token
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
      maxAge: 32 * 60 * 1000, // Cookie expiration after 32 minutest
    });

    // 5. Return final response
    return {
      ...user,
      token,
    };
  } catch (error) {
    console.error("Error in createUser:", error.message);
    throw new Error("Error signup user"); // return real error to client
  }
}

async function updateUserData(_, { name, username, bio }, context) {
  const userId = context.user.userId;

  try {
    const isSuspend = await isSuspended(userId);

    if (isSuspend) {
      throw new Error("Suspicious activity detected. Please try again later.");
    }

    const payload = await updateProifle(userId, name, username, bio);
    return payload;
  } catch (error) {
    console.log("Error updating userdata", error.message);
    throw new Error("Error updating userdata");
  }
}

async function updateAvatar(_, { file }, context) {
  const userId = context.user.userId;

  // console.log(file);
  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const isSuspend = await isSuspended(userId);

    if (isSuspend) {
      throw new Error("Suspicious activity detected. Please try again later.");
    }

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

  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const isSuspend = await isSuspended(userId);

    if (isSuspend) {
      throw new Error("Suspicious activity detected. Please try again later.");
    }

    const payload = findUserById(userId);

    if (!payload) {
      throw new Error("User not found");
    }

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
      throw new Error("Unauthorized");
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

    if (!user) {
      throw new Error("User not found");
    }

    delete user.password;

    context.res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true, // Makes the cookie inaccessible to client-side scripts
      secure: process.env.NODE_ENV === "production", // Ensure the cookie is sent over HTTPS in production
      maxAge: 32 * 60 * 1000, // Cookie expiration after 32 minutest
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
