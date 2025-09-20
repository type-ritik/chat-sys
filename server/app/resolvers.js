const { loginUser, createUser } = require("./services/UserAccountService");

const resolvers = {
  Query: {
    hello: () => "Hello World!",
    loginUser: loginUser,
  },
  Mutation: {
    createUser: createUser,
  },
};

module.exports = { resolvers };
