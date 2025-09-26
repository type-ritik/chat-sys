import { baseUrl } from "../config";

export const isValidEmail = (email: string) => {
  const regex = /^[a-zA-Z]{1,}[\d?\D]{1,}[@]{1}[a-z]{2,}.[com]{3}$/g;
  return regex.test(email);
};

export const fetchServer = async (payload: {
  email: string;
  password: string;
}) => {
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

  const result = await res.json();
  if (result.errors) {
    return { res: false, msg: result.errors[0].message };
  }

  // console.log(result);
  window.sessionStorage.setItem("token", result.data.loginUser.token);
  window.cookieStore.set("token", result.data.loginUser.token);
  window.localStorage.setItem("token", result.data.loginUser.token);

  return result;
};
