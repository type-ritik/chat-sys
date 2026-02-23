import { gql } from "@apollo/client";

export const baseUrl = "https://type-ritik-chat-sys-api.onrender.com/graphql";

export const isValidEmail = (email: string) => {
  const regex = /^[a-zA-Z]{1,}[\d?\D]{1,}[@]{1}[a-z]{2,}.[com]{3}$/g;
  return regex.test(email);
};

export const logOutMe = () => {
  window.sessionStorage.clear();
  window.localStorage.clear();
};

export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription ($userId: String!) {
    subNotify(userId: $userId) {
      content
      id
      requestedId
      sender {
        username
        name
      }
      senderId
      receiver {
        username
        name
      }
      receiverId
      isSeen
      timestamp
    }
  }
`;

export const CHATMSG_SUBS = gql`
  subscription ($userId: String!) {
    chatMsg(userId: $userId) {
      id
      userId
      message
      chatRoomId
      createdAt
    }
  }
`;
