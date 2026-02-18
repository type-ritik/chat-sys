const { gql } = require("graphql-tag");

const typeDefs = gql`
  scalar DateTime
  scalar JSON
  scalar Upload

  type User {
    id: ID!
    name: String!
    email: String!
    username: String!
    isAdmin: Boolean!
    createdAt: DateTime!
    profile: Profile
    status: String
    token: String
  }

  type AuditLogs {
    id: ID!
    table_name: String!
    action_type: String!
    record_id: String
    old_data: JSON
    new_data: JSON
    performed_by: String
    created_at: DateTime!
  }

  type UserProfile {
    id: ID!
    user: User
    profile: Profile
  }

  type Profile {
    id: ID!
    bio: String
    isActive: Boolean!
    avatarUrl: String!
  }

  type ChatRoomPayload {
    id: String!
    otherUser: User!
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
    chatRoomId: String
    otherUser: User
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

  type ChatRoomPayloadData {
    id: String!
    friendshipId: String!
    friendship: Friendship
    lastMsg: LastMsg
    createdAt: DateTime!
  }

  type FriendListPayload {
    id: ID!
    username: String
    name: String
    profile: Profile
  }

  type FriendReqPayload {
    id: String
    user: User
  }

  type ChatFriendPayload {
    id: ID!
    userId: String
    username: String
    profile: Profile
    name: String
  }

  type Query {
    loginUser(email: String!, password: String!): User!
    exploreFriends(username: String!): User!
    exploreChatFriend(username: String): ChatFriendPayload
    hello: String!
    friendList: [FriendListPayload!]!
    chatRoomList: [ChatRoomPayload!]!
    chatMessageList(chatRoomId: String!): [ChatMsgPayload!]!
    retrieveNotification: [Message!]!
    friendRequestList: [FriendReqPayload!]!
    chatCellData(chatRoomId: String!): ChatRoomCellData
    userData: User!
    adminLogin(email: String!, password: String!): User!
    usersRecordData: [User!]!
    chatMessagesRecordData: [ChatMsgPayload!]!
    userAuditLogsData: [AuditLogs!]!
  }

  type Mutation {
    sayHello(friendId: String!, msg: String): Boolean!
    sendMessage(chatRoomId: String!, text: String!): Boolean!
    createUser(name: String!, email: String!, password: String!): User!
    followFriend(friendId: String!): Boolean
    followResponse(friendshipId: String!, status: String!): Boolean
    chatRoomCell(friendshipId: String!): ChatRoomPayloadData
    updateUserData(name: String, username: String, bio: String): UserProfile
    updateAvatar(file: Upload): Profile
    adminActionOnUserAvalability(userId: String!, action: String!): User
  }

  type Subscription {
    subNotify(userId: String!): Message!
    chatMsg(userId: String!): ChatMsgPayload!
  }
`;

module.exports = { typeDefs };
