const { gql } = require("graphql-tag");

const typeDefs = gql`
  scalar DateTime

  type User {
    id: ID!
    name: String!
    email: String!
    username: String!
    isAdmin: Boolean!
    createdAt: DateTime!
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
    createdAt: DateTime!
  }

  type Message {
    id: ID!
    content: String!
    isSeen: Boolean!
    requestedId: String!
    receiverId: String!
    senderId: String!
    sender: User
    receiver: User
    profile: Profile
    timestamp: DateTime
  }

  type ChatMsgPayload {
    id: ID!
    userId: String!
    message: String!
    chatRoomId: String
    createdAt: DateTime!
  }

  type Friendship {
    id: ID!
    user: User!
    friend: User!
    status: String!
    createdAt: DateTime!
    otherUser: User!
  }

  type FriendReqPayload {
    id: ID!
    user: User!
    status: String!
    createdAt: DateTime!
  }

  type Query {
    loginUser(email: String!, password: String!): User!
    exploreFriends(username: String!): User!
    exploreChatFriend(username: String): Friendship
    hello: String!
    friendList: [Friendship!]!
    chatRoomList: [ChatRoomPayload!]!
    chatMessageList(chatRoomId: String!): [ChatMsgPayload!]!
    retrieveNotification: [Message!]!
    friendRequestList: [FriendReqPayload!]!
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
