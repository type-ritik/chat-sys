const { gql } = require("graphql-tag");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    username: String!
    isAdmin: Boolean!
    createdAt: String!
    profile: Profile
    token: String
  }

  type Profile {
    id: ID!
    bio: String
    isActive: Boolean!
    avatarUrl: String!
  }

  type ChatRoomPayload {
    id: String!
    friendShipId: String!
    createdAt: String!
  }

  type Message {
    id: ID!
    content: String!
    sender: String!
    isSeen: Boolean!
    requestedId: String!
    timestamp: String!
  }

  type ChatMsgPayload {
    id: ID!
    userId: String!
    message: String!
    chatRoomId: String
    createdAt: String
  }

  type NotificationPayload {
    msg: String!
  }

  type Friendship {
    id: ID!
    user: User
    friend: User
    userId: String
    friendId: String
    createdAt: String
  }

  type Query {
    messages: [Message!]!
    loginUser(email: String!, password: String!): User!
    exploreFriends(username: String!): User!
    exploreChatFriend(username: String): Friendship
    hello: String!
    friendList:[Friendship!]!
    chatRoomList:[ChatRoomPayload!]!
    chatMessageList(chatRoomId: String!):[ChatMsgPayload!]!
  }

  type Mutation {
    sayHello(friendId: String!, msg: String): Boolean!
    sendMessage(chatRoomId: String!, text: String!): Boolean!
    createUser(name: String!, email: String!, password: String!): User!
    followFriend(friendId: String!): Boolean
    followResponse(friendshipId: String!, status: String!): Boolean
    chatRoomCell(friendshipId: String!): ChatRoomPayload
  }

  type Subscription {
    subNotify(userId: String!): Message!
    chatMsg(userId: String!, msg: String): ChatMsgPayload!
  }
`;

module.exports = { typeDefs };
