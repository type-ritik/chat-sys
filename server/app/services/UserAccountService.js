const jwt = require("jsonwebtoken");
const { prisma } = require("../data/prisma");
const { comparePassword } = require("../utils/passKey");

async function loginUser(_, { email, password }, context) {
  const isUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!isUser) {
    throw new Error("No user found with this email");
  }

  const isPasswordValid = await comparePassword(password, isUser.password);

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign(
    { userId: isUser.id, role: isUser.isAdmin ? "admin" : "user" },
    process.env.JWT_SECRET
  );

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

  const token = jwt.sign(
    { userId: newUser.id, role: newUser.isAdmin ? "admin" : "user" },
    process.env.JWT_SECRET
  );

  console.log("New user created:", newUser);

  return { ...newUser, token };
}
module.exports = { loginUser, createUser };
