import { baseUrl } from "../config";

export const fetchServer = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
    console.log(payload)
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation($name: String!, $email: String!, $password: String!){
                createUser(name: $name, email: $email, password: $password) {
                    id
                    name
                    username
                    isAdmin
                    createdAt
                    token
                }
            }`,
      variables: payload,
    }),
  });

  const result = await res.json();
  if (result.errors) {
    return { res: false, msg: result.errors[0].message };
  }

  window.sessionStorage.setItem("token", result.data.createUser.token);
  window.cookieStore.set("token", result.data.createUser.token);
  window.localStorage.setItem("token", result.data.createUser.token);

  return result;
};
