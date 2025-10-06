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
