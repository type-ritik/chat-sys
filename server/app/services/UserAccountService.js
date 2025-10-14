const jwt = require("jsonwebtoken");
const { prisma } = require("../data/prisma");
const { comparePassword, hashPassword } = require("../utils/passKey");

async function loginUser(_, { email, password }, context) {
  // Check if the user exists with the given email
  const isUser = await prisma.user.findUnique({
    where: { email },
  });

  // If user does not exist, throw an error
  if (!isUser) {
    throw new Error("No user found with this email");
  }

  // Check if the password is valid
  const isPasswordValid = await comparePassword(password, isUser.password);

  // If password is invalid, throw an error
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  // Generate a JWT token for the authenticated user
  const token = jwt.sign(
    { userId: isUser.id, role: isUser.isAdmin ? "admin" : "user" },
    process.env.JWT_SECRET
  );

  console.log("User logged in:", isUser);

  // Return the user data along with the token
  return { ...isUser, token };
}

async function createUser(_, { name, email, password }, context) {
  // Check if a user with the given email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Create a username by taking the part before the "@" in the email
  const username = email.split("@")[0];

  // Hash the password before storing it
  const hashedPassword = await hashPassword(password);

  // Create the new user in the database
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      username,
    },
  });

  const defaultUrl =
    "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?_gl=1*1q4t3f4*_ga*Mzg1NDU4ODQyLjE3NjA0Mzk4NzA.*_ga_8JE65Q40S6*czE3NjA0Mzk4NzAkbzEkZzEkdDE3NjA0Mzk4NzkkajUxJGwwJGgw";

  const newProfile = await prisma.profile.create({
    data: {
      userId: newUser.id,
      avatarUrl: defaultUrl,
      isActive: true,
      bio: `Hi there, This is ${newUser.name}`,
    },
  });

  // Generate token
  const token = jwt.sign(
    { userId: newUser.id, role: newUser.isAdmin ? "admin" : "user" },
    process.env.JWT_SECRET
  );

  console.log("New user created:", newUser);

  // Return the new user payload with token
  return { ...newUser, profile: newProfile, token };
}

async function userData(_, obj, context) {
  const userId = context.user.userId;

  const payload = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      profile: true,
    },
  });

  console.log(payload);

  return payload;
}
module.exports = { loginUser, createUser, userData };
