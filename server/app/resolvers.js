const { exploreFriends } = require("./services/ExploreFriend");
const { loginUser, createUser } = require("./services/UserAccountService");

const resolvers = {
  Query: {
    hello: () => "Hello World!",
    loginUser: loginUser,
    exploreFriends: exploreFriends,
  },
  Mutation: {
    createUser: createUser,
  },
  // Subscribe: {
  //   subNotify: subNotify,
  // }
};

module.exports = { resolvers };
