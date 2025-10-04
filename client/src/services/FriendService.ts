import { gql } from "@apollo/client";
import { baseUrl } from "../config";

export const fetchFriend = async (payload: string) => {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
                query($username: String!) {
                    exploreFriends(username: $username) {
                        id
                        name
                        username
                    }
                }
            `,
      variables: { username: payload },
    }),
  });

  const result = await res.json();
  if (result.errors) {
    return { res: false, msg: result.errors[0].message };
  }

  return result;
};

export const fetchFollowFriend = async (payload: string) => {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: window.localStorage.getItem("token") || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        mutation($friendId: String!){
          followFriend(friendId: $friendId)
        }
      `,
      variables: { friendId: payload },
    }),
  });

  const result = await res.json();
  if (result.errors) {
    return { res: false, msg: result.errors[0].message };
  }

  return result;
};

export const FRIEND_LIST = gql`
  query {
    friendList {
      id
      status
      otherUser {
        id
        username
        name
      }
    }
  }
`;

export const FRIEND_REQUEST = gql`
  query {
    friendRequestList {
      id
      user {
        id
        name
        username
      }
      createdAt
      status
    }
  }
`;
