import { gql } from "@apollo/client";

export const NOTIFICATION_LIST = gql`
  query {
    retrieveNotification {
      id
      content
      requestedId
      sender {
        username
        name
        profile {
          avatarUrl
        }
      }
      receiver {
        username
        name
      }
      profile {
        isActive
        avatarUrl
      }
      isSeen
      senderId
      receiverId
      timestamp
    }
  }
`;
