const {
  validateAuthInput,
  findUserByEmail,
  findUserById,
  userRecord,
  isSuspiciousLogin,
  createLoginAttempt,
  blockUser,
} = require("../utils/user.config");
const { comparePassword } = require("../utils/passKey");
const { genToken } = require("../utils/auth");

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

    // If user not found, report "User Found Error" message
    // if (!userCheck.res) {
    //   console.log("User Error", userCheck.err);
    //   return {
    //     error: userCheck.err,
    //   };
    // }

    const now = new Date();

    const ipAddress = context.req.ip.replace("::ffff:", "");

    const record = await isSuspiciousLogin(userCheck.id, ipAddress);

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
    console.log("Login Success:", userCheck);

    return { ...userCheck, token };
  } catch (error) {
    console.log("Server Error", error.message);

    throw new Error(error.message);
  }
}

// Create User
async function createUser(_, { name, email, password }, context) {
  try {
    const validationErrors = validateAuthInput(email, password);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors);
    }

    console.log("Input validation is completed");

    const isUserPresent = await findUserByEmail(email);
    console.log(isUserPresent);
    if (isUserPresent) {
      throw new Error("User already exists with this email");
    }

    console.log("User validation is completed");

    const user = await userRecord(name, email, password);
    console.log("userError", user);
    if (!user) {
      throw new Error("User not found.");
    }

    const token = genToken(user.id, user.isAdmin);

    return { ...user, token };
  } catch (error) {
    console.log("Server Error", error.message);
    throw new Error("Server error creating user");
  }
}

async function userData(_, obj, context) {
  const userId = context.user.userId;

  const payload = findUserById(userId);

  return payload;
}
module.exports = { loginUser, createUser, userData };
