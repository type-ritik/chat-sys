import { gql } from "@apollo/client";

// export const FETCH_CHATROOM_LIST = gql`
//   query {
//     chatRoomList {
//       id
//       friendship
//       createdAt
//     }
//   }
// `

export const CREATE_CHATROOM_CELL = gql`
  mutation ChatRoomCell($friendshipId: String!) {
    chatRoomCell(friendshipId: $friendshipId) {
      id
      friendshipId
      createdAt
    }
  }
`;

export const RETRIEVE_CHAT_MSG = gql`
  query ChatMessageList($chatRoomId: String!) {
    chatMessageList(chatRoomId: $chatRoomId) {
      id
      userId
      message
      chatRoomId
      createdAt
    }
  }
`;

export const SEND_MSG = gql`
  mutation SendMessage($chatRoomId: String!, $text: String!) {
    sendMessage(chatRoomId: $chatRoomId, text: $text)
  }
`;

export const RETRIEVE_CHATROOM_DATA = gql`
  query ChatCellData($chatRoomId: String!) {
    chatCellData(chatRoomId: $chatRoomId) {
      id
      friendshipId
      friendship {
        user {
          id
          name
          username
          profile {
            id
            isActive
            avatarUrl
          }
        }
        friend {
          id
          name
          username
          profile {
            id
            isActive
            avatarUrl
          }
        }
      }
    }
  }
`;

export const EXPLORE_FRIEND = gql`
  query ExploreChatFriend($username: String) {
    exploreChatFriend(username: $username) {
      id
      userId
      username
      name
      createdAt
    }
  }
`;

export const RETRIEVE_CHATROOM_LIST = gql`
  query {
    chatRoomList {
      id
      friendship {
        otherUser {
          username
          name
          id
        }
      }
      lastMsg {
        id
        userId
        message
        createdAt
      }
    }
  }
`;
