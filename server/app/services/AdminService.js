const { genToken } = require("../utils/auth");
const { comparePassword } = require("../utils/passKey");
const {
  validateAuthInput,
  findUserByEmail,
  userList,
  chatMessageList,
  retriveAuditLogs,
  isValidUUID,
  findUserById,
  suspend,
  suspensionResolve,
} = require("../utils/user.config");

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

async function usersRecordData(_, obj, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new Error("Unauthorized: User not logged in");
  }

  if (!context.user.role) {
    throw new Error("Unauthorized: Admin access required");
  }

  try {
    const users = await userList();
    return users;
  } catch (error) {
    console.error("Error fetching users:", error.message);
    throw new Error("Error fetching users");
  }
}

async function chatMessagesRecordData(_, obj, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new Error("Unauthorized: User not logged in");
  }

  if (!context.user.role) {
    throw new Error("Unauthorized: Admin access required");
  }

  try {
    const chatMessage = await chatMessageList();
    return chatMessage;
  } catch (error) {
    console.error("Error fetching users:", error.message);
    throw new Error("Error fetching users");
  }
}

async function userAuditLogsData(_, obj, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new Error("Unauthorized: User not logged in");
  }

  if (!context.user.role) {
    throw new Error("Unauthorized: Admin access required");
  }

  try {
    const logs = await retriveAuditLogs();
    return logs;
  } catch (error) {
    console.log("Error fetching user logs: ", error.message);
    throw new Error("Error fetching user logs");
  }
}

async function adminActionOnUserAvalability(_, { userId, action }, context) {
  if (!context.user.userId) {
    throw new Error("Unauthorized: User not logged in");
  }

  if (!context.user.role) {
    throw new Error("Unauthorized: Admin access required");
  }

  if (!userId) {
    throw new Error("UserId can't be empty");
  }

  const userExists = await findUserById(userId);

  if (!userExists) {
    throw new Error("User not found");
  }

  if (!isValidUUID(userId)) {
    throw new Error("Invalid userId format");
  }

  if (!action) {
    throw new Error("Define action");
  }

  if (action !== "SUSPEND" || action !== "UNSUSPEND") {
    throw new Error("Invalid action");
  }

  try {
    if (action === "SUSPEND") {
      const res = await suspend(userId);
      return res;
    } else {
      const res = await suspensionResolve(userId);
      return res;
    }
  } catch (error) {
    console.log("Error suspending user:", error.message);
    throw new Error("Error suspending user");
  }
}

module.exports = {
  adminLogin,
  usersRecordData,
  chatMessagesRecordData,
  userAuditLogsData,
  adminActionOnUserAvalability,
};
