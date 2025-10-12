import { gql } from "@apollo/client";

export const USER_DATA = gql`
  query UserData {
    userData {
      id
      name
      email
      username
      profile {
        id
        isActive
        avatarUrl
        bio
      }
    }
  }
`;
