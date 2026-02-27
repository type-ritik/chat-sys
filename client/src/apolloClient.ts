import { ApolloClient, gql, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import createUploadLink from "apollo-upload-client/UploadHttpLink.mjs";
import { getMainDefinition, Observable } from "@apollo/client/utilities";
import { baseUrl } from "./config";
import { ApolloLink } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { c } from "@apollo/client/react/internal/compiler-runtime";

// 1. HTTP link for queries & mutation
// const httpLink = new HttpLink({
//   uri: baseUrl, // server HTTP endpoint
// });

// Configure token on Apollo Client to inject it automatically
const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem("token");
  operation.setContext({
    headers: {
      authorization: token ? `${token}` : "",
    },
  });
  return forward(operation);
});

// Detect if we are on SSL (Render) or local
const isSecure = window.location.protocol === "https:";
const wsProtocol = isSecure ? "wss" : "ws";

// Use your Render backend URL (e.g., chat-sys-server.onrender.com)
const API_DOMAIN = baseUrl?.replace(/^https?:\/\//, "") || "localhost:5000";

// 2. WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: `${wsProtocol}://${API_DOMAIN}`,
    connectionParams: {
      authToken: localStorage.getItem("token"),
    },
  }),
);

let refreshTokenPromise: any = null;

const refreshToken = async () => {
  if (refreshTokenPromise) return refreshTokenPromise;

  refreshTokenPromise = (async () => {
    try {
      // Using native fetch to avoid the Apollo Link interceptors
      console.log("Error this is something new error");
      const response = await fetch(baseUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationName: "CreateNewAccessToken",
          query: `mutation CreateNewAccessToken{ createNewAccessToken { token } }`,
        }),
      });

      const result = await response.json();

      const token = result.data?.createNewAccessToken?.token;

      if (!token) throw new Error("No token received");

      localStorage.setItem("token", token);
      return token;
    } catch (error) {
      localStorage.removeItem("token");
      throw error;
    } finally {
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

const uploadLink = new createUploadLink({
  uri: baseUrl,
  credentials: "include",
  headers: {
    "x-apollo-operation-name": "true",
    "apollo-require-preflight": "true",
  },
});

const errorLink = onError((obj) => {
  const { operation, forward, networkError } = obj;
  if (obj.error) {
    for (let err of obj.error.errors) {
      // Check the extensions code we set in getContext
      if (
        err.extensions?.code === "UNAUTHORIZED" ||
        err.message === "Unauthorized"
      ) {
        return new Observable((observer) => {
          refreshToken()
            .then((newToken) => {
              operation.setContext(({ headers = {} }) => ({
                headers: {
                  ...headers,
                  authorization: newToken, // Make sure this matches your Bearer logic
                },
              }));

              const subscriber = forward(operation).subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              });
            })
            .catch((refreshError) => {
              observer.error(refreshError);
            });
        });
      }
    }
  }

  if (
    networkError &&
    "statusCode" in networkError &&
    networkError.statusCode === 401
  ) {
    for (let err of obj.error.errors) {
      // Check the extensions code we set in getContext
      if (
        err.extensions?.code === "UNAUTHORIZED" ||
        err.message === "Unauthorized"
      ) {
        return new Observable((observer) => {
          refreshToken()
            .then((newToken) => {
              operation.setContext(({ headers = {} }) => ({
                headers: {
                  ...headers,
                  authorization: newToken, // Make sure this matches your Bearer logic
                },
              }));

              const subscriber = forward(operation).subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              });
            })
            .catch((refreshError) => {
              observer.error(refreshError);
            });
        });
      }
    }
  }
});

// const wsLink = new GraphQLWsLink(
//   createClient({
//     url: wsBaseUrl, // server WS endpoint
//     connectionParams: {
//       authToken: localStorage.getItem("token"), // auth for subs
//     },
//   })
// );

// 3. Split based on operation type (query/mutation vs subscription)
const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return (
      def.kind === "OperationDefinition" && def.operation === "subscription"
    );
  },
  wsLink, // subscriptions go here
  // authLink.concat(uploadLink), // apply auth and upload for queries/mutations
  authLink.concat(errorLink).concat(uploadLink),
  // from([authLink, errorLink, uploadLink]),
);

// 4. Create client
export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
