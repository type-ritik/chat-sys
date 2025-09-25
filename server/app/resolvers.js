const { loginUser, createUser } = require("./services/UserAccountService");
const {
  exploreFriends,
  exploreChatFriend,
  friendList,
} = require("./services/ExploreFriend");
const {
  chatRoomCell,
  sendMessage,
  chatRoomList,
  chatMessageList,
} = require("./services/chatServices");
const { pubsub } = require("./data/pubsub");
const { followFriend, followResponse } = require("./services/FollowFriend");

const resolvers = {
  Query: {
    hello: () => "Hello World!",
    loginUser,
    exploreFriends,
    exploreChatFriend,
    friendList,
    chatRoomList,
    chatMessageList
  },

  Mutation: {
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
