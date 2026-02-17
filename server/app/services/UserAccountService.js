const {
  validateAuthInput,
  findUserByEmail,
  findUserById,
  userRecord,
  updateProifle,
  isSuspiciousLogin,
  createLoginAttempt,
  blockUser,
  alterAvatar,
} = require("../utils/user.config");
const { comparePassword } = require("../utils/passKey");
const { genToken } = require("../utils/auth");
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
    const userCheck = await findUserByEmail(email);

    const now = new Date();

    const ipAddress = context.req.ip.replace("::ffff:", "");

    const record = await isSuspiciousLogin(userCheck.id);

    if (
      record &&
      record.blocked_until &&
      now < new Date(record.blocked_until)
    ) {
      console.log("User blocked. Try again later.");
      throw new Error("User blocked. Try again later.");
    }

    // Match the password
    const isValidPass = await comparePassword(password, userCheck.password);

    // If not matched, report "Incorrect password Error" message
    if (!isValidPass) {
      console.log("Validation Error:", "Not valid password");
      const updated = await createLoginAttempt(userCheck.id, ipAddress);

      if (updated.attempts >= 100) {
        const msg = await blockUser(userCheck.id);
        throw new Error(msg.error);
      }
      throw new Error("Invalid password");
    }

    const token = genToken(userCheck.id, userCheck.isAdmin);

    return { ...userCheck, token };
  } catch (error) {
    console.log("Error login user", error.message);

    throw new Error("Error login user");
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

    console.log("User created successfully:", user.email);

    // 4. Generate token
    const token = genToken(user.id, user.isAdmin);

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

  console.log(bio);

  try {
    const payload = await updateProifle(userId, name, username, bio);
    return payload;
  } catch (error) {
    console.log("Error updating userdata", error.message);
    throw new Error("Error updating userdata");
  }
}

async function updateAvatar(_, { file }, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const uploadedFile = await file;

  console.log(file);
  try {
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

    console.log("Result: ", result);
    const payload = await alterAvatar(userId, result.secure_url);
    return payload;
  } catch (error) {
    console.log("Error updating avatar", error.message);
    throw new Error("Error updating avatar");
  }
}

async function userData(_, obj, context) {
  const userId = context.user.userId;

  const payload = findUserById(userId);

  return payload;
}
module.exports = {
  loginUser,
  createUser,
  userData,
  updateUserData,
  updateAvatar,
};
