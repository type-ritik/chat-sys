const { prisma } = require("./data/prisma");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("./utils/passKey");

const resolvers = {
  Query: {
    hello: () => "Hello World!",
  },
  Mutation: {
    createUser: async (_, { name, email, password }, context) => {
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
    },
  },
};

module.exports = { resolvers };
