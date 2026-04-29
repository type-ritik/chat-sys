const { prisma } = require("../data/prisma");
const { hashPassword } = require("../utils/passKey");

// Update user profile data
async function updateProfile(userId, name, username, bio) {
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

async function findUserById(userId) {
  const user = await prisma.user
    .findFirst({
      where: {
        id: userId,
        status: "ACTIVE",
      },
      include: {
        profile: true,
      },
    })
    .catch((error) => {
      console.error("Error finding user by ID:", error.message);
      throw new Error("Error finding user by ID");
    });

  return user;
}

async function findUserByEmail(email) {
  try {
    const user = await prisma.user
      .findFirst({
        where: { email, status: "ACTIVE" },
        include: {
          profile: true,
        },
      })
      .catch((error) => {
        console.error("Error finding user by email:", error.message);
        throw new Error("Error finding user by email");
      });

    return user;
  } catch (error) {
    console.error("Error finding user by email:", error.message);
    throw new Error("Error finding user by email");
  }
}

async function userRecord(name, email, password) {
  try {
    const newUser = await prisma.user
      .create({
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
      })
      .catch((error) => {
        console.error("Error creating user:", error.message);
        throw new Error("Error creating user: ", error.meta.target[0]);
      });

    console.log("User email: ", newUser.email);

    delete newUser.password;
    delete newUser.profile.userId;

    return newUser;
  } catch (error) {
    console.error("User creation failed with", error.message);
    throw new Error(error.message);
  }
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

  // console.log(createAttempt);

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
async function isSuspended(id) {
  const res = await prisma.user.findUnique({
    where: { id },
  });

  // console.log("Data is suspend: ", res);

  if (res.status.toString().toUpperCase().match("SUSPENDED")) {
    console.log("I am suspended");
    return true;
  } else {
    console.log("I am not suspended");
    return false;
  }
}

// Suspend User
async function suspend(userId) {
  if (isSuspended(userId)) {
    throw new Error("User is already suspended");
  }

  if (findUserById(userId).then((data) => data.isAdmin)) {
    throw new Error("Admin users cannot be suspended");
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

  if (findUserById(userId).then((data) => data.isAdmin)) {
    throw new Error("Admin users cannot be suspended");
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
  createLoginAttempt,
  isSuspiciousLogin,
  blockUser,
  updateProfile,
  alterAvatar,
  userList,
  chatMessageList,
  retriveAuditLogs,
  suspend,
  suspensionResolve,
  isSuspended,
};
