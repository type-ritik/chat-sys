const {
  validateAuthInput,
  findUserByEmail,
  findUserById,
  userRecord,
} = require("../utils/user.config");
const { comparePassword } = require("../utils/passKey");
const { genToken } = require("../utils/auth");

// User Login
async function loginUser(_, { email, password }, context) {
  try {
    const validationErrors = validateAuthInput(email, password);
    if (validationErrors.length > 0) {
      console.log("Validation Error", validationErrors);
      return {
        error: validationErrors,
      };
    }

    // User check
    const userCheck = await findUserByEmail(email);
    if (!userCheck.res) {
      console.log("User Error", userCheck.err);
      return {
        error: userCheck.err,
      };
    }

    // Password check
    const isValidPass = await comparePassword(
      password,
      userCheck.payload.password
    );
    if (!isValidPass) {
      console.log("Validation Error:", "Not valid password");
      return {
        error: "Invalid password",
      };
    }

    const token = genToken(userCheck.payload.id, userCheck.payload.isAdmin);
    console.log("Login Success:", userCheck.payload);

    return { ...userCheck.payload, token };
  } catch (error) {
    console.log("Server Error", error.message);
    return {
      error: error.message,
    };
  }
}

// Create User
async function createUser(_, { name, email, password }, context) {
  try {
    const validationErrors = validateAuthInput(email, password);
    if (validationErrors.length > 0) {
      return {
        error: validationErrors,
      };
    }

    console.log("Input validation is completed")

    const isUserPresent = await findUserByEmail(email);
    console.log(isUserPresent)
    if (isUserPresent.res) {
      return {
        error: "User already exists with this email",
      };
    }

    console.log("User validation is completed")


    const user = await userRecord(name, email, password);
    console.log("userError",user);
    if (!user) {
      return { error: user.error };
    }

    const token = genToken(user.id, user.isAdmin);

    return { ...user, token };
  } catch (error) {
    console.log("Server Error", error.message);
    return {
      error: error.message,
    };
  }
}

async function userData(_, obj, context) {
  const userId = context.user.userId;

  const payload = findUserById(userId);

  console.log(payload);

  return payload;
}
module.exports = { loginUser, createUser, userData };
