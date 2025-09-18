const { prisma } = require("./data/prisma");

const resolvers = {
  Query: {
    hello: () => "Hello World!",
  },
  Mutation: {
    createUser: async (_, { name, email, password }, context) => {
      const username = email.split("@")[0];

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password,
          username,
        },
      });

      console.log("New user created:", newUser);

      return newUser;
    },
  },
};

module.exports = { resolvers };
