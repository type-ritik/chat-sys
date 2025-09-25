import { baseUrl } from "../config";

export const fetchServer = async (payload) => {
  console.log(payload);
  const res = await fetch(baseUrl, {
    method: "POST",
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
              email
            }
          }
        `,
      variables: payload,
    }),
  });

  if (!res.ok) {
    throw new Error("Client Error");
  }

  const result = await res.json();

  console.log(result.data.loginUser);
  window.localStorage.setItem("token", result.data.loginUser.token);

  return result;
};
