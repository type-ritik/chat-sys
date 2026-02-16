const { prisma } = require("../data/prisma");
const { hashPassword } = require("../utils/passKey");

function isValidUUID(uuid) {
  const uuidRegex =
    /^[0-9A-F]{8}-[0-9A-F]{4}-[1-5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  return uuidRegex.test(uuid);
}

// Update user profile data
async function updateProifle(userId, name, username, bio) {
  if (!name && !username && !bio) {
    throw new Error("All fields are required");
  } else if (name && username && bio) {
    try {
      const updateUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          username,
          profile: {
            update: {
              bio,
            },
          },
        },
      });

      return updateUser;
    } catch (error) {
      console.error("Error updating user profile:", error.message);
      throw new Error("Error updating user profile");
    }
  } else if (name && username) {
    try {
      const updateUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          username,
        },
      });

      return updateUser;
    } catch (error) {
      console.error("Error updating user profile:", error.message);
      throw new Error("Error updating user profile");
    }
  } else if (name && bio) {
    try {
      const updateUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          profile: {
            update: {
              bio,
            },
          },
        },
      });

      return updateUser;
    } catch (error) {
      console.error("Error updating user profile:", error.message);
      throw new Error("Error updating user profile");
    }
  } else if (username && bio) {
    try {
      const updateUser = await prisma.user.update({
        where: { id: userId },
        data: {
          username,
          profile: {
            update: {
              bio,
            },
          },
        },
      });

      return updateUser;
    } catch (error) {
      console.error("Error updating user profile:", error.message);
      throw new Error("Error updating user profile");
    }
  }
  if (name) {
    try {
      const updateUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
        },
      });

      return updateUser;
    } catch (error) {
      console.error("Error updating user profile:", error.message);
      throw new Error("Error updating user profile");
    }
  } else if (username) {
    try {
      const updateUser = await prisma.user.update({
        where: { id: userId },
        data: {
          username,
        },
      });

      return updateUser;
    } catch (error) {
      console.error("Error updating user profile:", error.message);
      throw new Error("Error updating user profile");
    }
  } else if (bio) {
    try {
      const updateUser = await prisma.profile.update({
        where: { userId: userId },
        data: {
          bio,
        },
      });

      return updateUser;
    } catch (error) {
      console.error("Error updating user profile:", error.message);
      throw new Error("Error updating user profile");
    }
  } else {
    throw new Error("No valid fields to update");
  }
}

async function alterAvatar(userId, avatarUrl) {
  try {
    const updateAvatar = await prisma.profile.update({
      where: {
        userId: userId,
      },
      data: {
        avatarUrl: avatarUrl,
      },
    });

    return updateAvatar;
  } catch (error) {
    console.error("Error updating avatar:", error.message);
    throw new Error("Error updating avatar");
  }
}

// Validation function
function validateAuthInput(email, password) {
  const errors = [];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (!emailRegex.test(email)) {
    errors.push("Invalid email format");
  }
  if (!password || password.length < 8) {
    errors.push("Password must be at least 6 characters long");
  }

  return errors;
}

async function findUserById(userId) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      profile: true,
    },
  });

  return user;
}

async function findUserByEmail(email) {
  const user = await prisma.user.findFirst({
    where: { email },
    include: {
      profile: true,
    },
  });

  return user;
}

async function userRecord(name, email, password) {
  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        username: email.split("@")[0],
        isAdmin: false,
        profile: {
          create: {
            avatarUrl:
              "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
            isActive: true,
            bio: `Hi there, This is ${name}`,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return { user: newUser };
  } catch (err) {
    console.error("User creation failed:", err.message);
    return { error: "Database error creating user" };
  }
}

async function isValidUsername(username) {
  return (
    typeof username === "string" && username.length > 2 && username.length < 20
  );
}

async function isSuspiciousLogin(userId) {
  const record = await prisma.loginAttempts.findFirst({
    where: { userId },
  });

  return record;
}

async function createLoginAttempt(userId, ip) {
  const createAttempt = await prisma.loginAttempts.upsert({
    where: { userId },
    update: {
      userId,
      attempts: {
        increment: 1,
      },
      ipAddress: ip,
    },
    create: {
      userId,
      ipAddress: ip,
      attempts: 1,
    },
  });

  console.log(createAttempt);

  return createAttempt;
}

// User Blocked
async function blockUser(userId) {
  const blockUntil = await prisma.loginAttempts.update({
    where: {
      userId,
    },
    data: {
      blocked_until: new Date(Date.now() + 30 * 60 * 1000),
      status: "suspicious",
    },
  });

  return {
    error: "Too many attempts. Blocked for 30 mins.",
  };
}

// User List
async function userList() {
  const list = await prisma.user.findMany({
    take: 12,
    orderBy: {
      id: "asc",
    },
  });

  return list;
}

// Message List
async function chatMessageList() {
  const list = await prisma.chatRoomMessage.findMany({
    take: 12,
    orderBy: {
      createdAt: "desc",
    },
  });
  return list;
}

// Audit logs
async function retriveAuditLogs() {
  const logs = await prisma.auditLog.findMany({
    take: 12,
    orderBy: {
      created_at: "desc",
    },
  });

  return logs;
}

// Is already suspended
async function isSuspended(userId) {
  const res = await prisma.user.findFirst({
    where: { id: userId, status: "SUSPENDED" },
  });

  console.log("Suspended response: ", res);
  if (!res) {
    return false;
  }
  return true;
}

// Suspend User
async function suspend(userId) {
  if (isSuspended(userId)) {
    throw new Error("User is already suspended");
  }

  const res = await prisma.user.update({
    where: { id: userId },
    data: {
      status: "SUSPENDED",
    },
  });
  return res;
}

// Resolve suspendsion
async function suspensionResolve(userId) {
  if (!isSuspended(userId)) {
    throw new Error("User is not suspended");
  }

  const res = await prisma.user.update({
    where: { id: userId },
    data: {
      status: "ACTIVE",
    },
  });

  return res;
}

module.exports = {
  userRecord,
  findUserByEmail,
  findUserById,
  validateAuthInput,
  isValidUsername,
  createLoginAttempt,
  isValidUUID,
  isSuspiciousLogin,
  blockUser,
  updateProifle,
  alterAvatar,
  userList,
  chatMessageList,
  retriveAuditLogs,
  suspend,
  suspensionResolve,
};
