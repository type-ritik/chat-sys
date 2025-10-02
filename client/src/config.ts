import { gql } from "@apollo/client";

export const baseUrl = "http://localhost:4000/graphql";

export const wsBaseUrl = "ws://localhost:4000/graphql";

export const isValidEmail = (email: string) => {
  const regex = /^[a-zA-Z]{1,}[\d?\D]{1,}[@]{1}[a-z]{2,}.[com]{3}$/g;
  return regex.test(email);
};

export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription ($userId: String!) {
    subNotify(userId: $userId) {
      id
      content
      sender
      isSeen
      requestedId
      timestamp
    }
  }
`;
