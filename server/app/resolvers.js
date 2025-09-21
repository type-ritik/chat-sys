const { loginUser, createUser } = require("./services/UserAccountService");
const { exploreFriends } = require("./services/ExploreFriend");
const { pubsub } = require("./data/pubsub");

const resolvers = {
  Query: {
    hello: () => "Hello World!",
    loginUser: loginUser,
    exploreFriends: exploreFriends,
  },

  Mutation: {
    sayHello: async (_, { friendId, msg }, context) => {
      // Publish directly via graphql-redis-subscriptions
      console.log("User Send Message to Friend: ", friendId);
      await pubsub.publish(`CHATMSG:${friendId}`, {
        // Here, We are returning the message to user as a payload based of typeDef
        chatMsg: { from: friendId, message: msg },
      });
      console.log("Message Published to Redis");

      return true;
    },

    createUser,
  },

  Subscription: {
    subNotify: {
      subscribe: (_, { userId }) => {
        console.log("User Id subscribe Notification: ", userId);
        return pubsub.asyncIterator(`NOTIFICATIONS:${userId}`);
      },
    },

    chatMsg: {
      subscribe: async (_, { userId }) => {
        console.log(`User:${userId} Subscribed to Chat Messages`);
        return pubsub.asyncIterator(`CHATMSG:${userId}`);
      },
    },
  },
};

module.exports = { resolvers };
