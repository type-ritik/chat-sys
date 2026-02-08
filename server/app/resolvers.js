const {
  loginUser,
  createUser,
  userData,
  updateUserData,
  updateAvatar,
} = require("./services/UserAccountService");
const {
  exploreFriends,
  exploreChatFriend,
  friendList,
  friendRequestList,
} = require("./services/ExploreFriend");
const {
  chatRoomCell,
  sendMessage,
  chatRoomList,
  chatMessageList,
  chatCellData,
} = require("./services/chatServices");
const { pubsub } = require("./data/pubsub");
const { followFriend, followResponse } = require("./services/FollowFriend");
const { retrieveNotification } = require("./services/Notification");
const { GraphQLScalarType, Kind } = require("graphql");
const { adminLogin } = require("./services/AdminService");

const resolvers = {
  Friendship: {
    otherUser: (parent, _, context) => {
      const { userId } = context.user; // logged-in user ID

      if (parent.userId === userId) {
        return parent.friend; // I initiated → return friend
      } else {
        return parent.user; // I was added → return user
      }
    },
  },
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "ISO-8601 DateTime scalar",
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      return value instanceof Date
        ? value.toISOString()
        : new Date(value).toISOString();
    },
    parseLiteral(ast) {
      return ast.kind === Kind.STRING ? new Date(ast.value) : null;
    },
  }),
  Query: {
    hello: () => "Hello World!",
    userData,
    loginUser,
    exploreFriends,
    exploreChatFriend,
    friendList,
    chatRoomList,
    chatMessageList,
    retrieveNotification,
    friendRequestList,
    chatCellData,
    adminLogin,
  },

  Mutation: {
    sendMessage,
    chatRoomCell,
    followFriend,
    createUser,
    followResponse,
    updateUserData,
    updateAvatar,
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
