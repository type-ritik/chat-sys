const { prisma } = require("../data/prisma");
const { hashPassword } = require("../utils/passKey");

function isValidUUID(uuid) {
  const uuidRegex =
    /^[0-9A-F]{8}-[0-9A-F]{4}-[1-5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  return uuidRegex.test(uuid);
}

// Validation function
function validateAuthInput(email, password) {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

  if (!user) {
    return {
      res: false,
      // No user found with this userId
      err: user.error,
      payload: null,
    };
  }

  return {
    res: true,
    err: "",
    payload: user,
  };
}

async function findUserByEmail(email) {
  const user = await prisma.user.findFirst({
    where: { email },
    include: {
      profile: true,
    },
  });

  if (!user) {
    return {
      res: false,
      // No user found with this email
      err: "User is not found",
      payload: null,
    };
  }

  return {
    res: true,
    err: "",
    payload: user,
  };
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
              "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?_gl=1*1q4t3f4*_ga*Mzg1NDU4ODQyLjE3NjA0Mzk4NzA.*_ga_8JE65Q40S6*czE3NjA0Mzk4NzAkbzEkZzEkdDE3NjA0Mzk4NzkkajUxJGwwJGgw",
            isActive: true,
            bio: `Hi there, This is ${name}`,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return { ...newUser };
  } catch (err) {
    return {
      error: "Server Error (Record new data)",
    };
  }
}

async function isValidUsername(username) {
  return (
    typeof username === "string" && username.length > 2 && username.length < 20
  );
}

async function isSuspiciousLogin(userId, ip) {
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
};
