const { genToken } = require("../utils/auth");
const { comparePassword } = require("../utils/passKey");
const { validateAuthInput, findUserByEmail } = require("../utils/user.config");

// Admin Login
async function adminLogin(_, { email, password }, context) {
  const isValid = validateAuthInput(email, password);

  if (isValid.length > 0) {
    throw new Error(isValid.join(", "));
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    if (!user.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const token = genToken(user.id, user.isAdmin);

    return {
      token,
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
      profile: {
        id: user.profile.id,
        avatarUrl: user.profile.avatarUrl,
        isActive: user.profile.isActive,
      },
    };
  } catch (error) {
    console.error("Error during admin login:", error.message);
    throw new Error("Error during admin login");
  }
}

module.exports = {
  adminLogin,
};
