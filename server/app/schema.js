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
    friendshipId: String!
    friendship: Friendship
    lastMsg: LastMsg
    createdAt: DateTime!
  }

  type LastMsg {
    id: String!
    chatRoomId: String
    userId: String
    message: String
    createdAt: DateTime
  }

  type ChatRoomCellData {
    id: String!
    friendshipId: String!
    friendship: Friendship!
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
    user: User
    friend: User
    status: String!
    createdAt: DateTime!
    otherUser: User
  }

  type FriendReqPayload {
    id: ID!
    user: User!
    status: String!
    createdAt: DateTime!
  }

  type ChatFriendPayload {
    id: ID!
    userId: String
    username: String
    name: String
    createdAt: DateTime!
  }

  type Query {
    loginUser(email: String!, password: String!): User!
    exploreFriends(username: String!): User!
    exploreChatFriend(username: String): ChatFriendPayload
    hello: String!
    friendList: [Friendship!]!
    chatRoomList: [ChatRoomPayload!]!
    chatMessageList(chatRoomId: String!): [ChatMsgPayload!]!
    retrieveNotification: [Message!]!
    friendRequestList: [FriendReqPayload!]!
    chatCellData(chatRoomId: String!): ChatRoomCellData
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
    chatMsg(userId: String!): ChatMsgPayload!
  }
`;

module.exports = { typeDefs };
