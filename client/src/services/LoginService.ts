import { baseUrl } from "../config";

export const fetchServer = async (payload: {
  email: string;
  password: string;
}) => {
  // console.log(payload);
  const res = await fetch(baseUrl, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
          query($email: String!, $password: String!) {
            loginUser(email: $email, password: $password) {
              token
              id
              username
              name
              status
              email
              profile {
                id
                bio
                avatarUrl
                isActive
              }
            }
          }
        `,
      variables: payload,
    }),
  });

  const result = await res.json();

  if (!result.data) {
    return result;
  }

  // console.log(result);
  window.sessionStorage.setItem("token", result.data.loginUser.token);
  window.sessionStorage.setItem("userId", result.data.loginUser.id);
  window.sessionStorage.setItem("username", result.data.loginUser.username);

  window.localStorage.setItem("token", result.data.loginUser.token);
  window.localStorage.setItem("userId", result.data.loginUser.id);
  window.localStorage.setItem("username", result.data.loginUser.username);

  return result;
};
