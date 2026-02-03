import { gql } from "@apollo/client";
import { baseUrl } from "../config";

export const USER_DATA = gql`
  query UserData {
    userData {
      id
      name
      username
      isAdmin
      profile {
        id
        isActive
        avatarUrl
        bio
      }
    }
  }
`;

export const updateAvatar = async (payload: { avatarUrl: string }) => {
  // console.log(payload.avatarUrl);

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: window.localStorage.getItem("token") || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation($avatarUrl: String!){
                updateAvatar(avatarUrl: $avatarUrl) {
                  id
                  bio
                  avatarUrl
                }
              }`,
      variables: payload,
    }),
  });

  const result = await res.json();
  // console.log("Updated: ", result);
  if (result.errors) {
    return result;
  }
  return result;
};

export const updateData = async (payload: {
  name: string;
  username: string;
  bio: string;
}) => {
  // console.log("MY paylaod: ", payload);
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: window.localStorage.getItem("token") || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation($name: String!, $username: String!, $bio: String!){
                updateUserData(name: $name, username: $username, bio: $bio) {
                    id
                }
            }`,
      variables: payload,
    }),
  });

  const result = await res.json();
  if (result.errors) {
    throw new Error("Server error");
  }
  return result;
};
