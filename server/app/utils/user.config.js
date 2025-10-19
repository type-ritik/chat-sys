const { prisma } = require("../data/prisma");
const { hashPassword } = require("../utils/passKey");

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
      profile: true
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
  } catch(err) {
    return {
      error: "Server Error (Record new data)"
    }
  }
}

module.exports = {
  userRecord,
  findUserByEmail,
  findUserById,
  validateAuthInput,
};
