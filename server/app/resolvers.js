const { loginUser, createUser } = require("./services/UserAccountService");
const {
  exploreFriends,
  exploreChatFriend,
} = require("./services/ExploreFriend");
const {chatRoomCell, sendMessage} = require("./services/chatServices")
const { pubsub } = require("./data/pubsub");
const { followFriend, followResponse } = require("./services/FollowFriend");

const resolvers = {
  Query: {
    hello: () => "Hello World!",
    loginUser,
    exploreFriends,
    exploreChatFriend,
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
    sendMessage,
    chatRoomCell,
    followFriend,
    createUser,
    followResponse,
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
