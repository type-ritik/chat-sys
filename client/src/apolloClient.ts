import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { baseUrl, wsBaseUrl } from "./config";
import { ApolloLink } from "@apollo/client";

// 1. HTTP link for queries & mutation
const httpLink = new HttpLink({
  uri: baseUrl, // server HTTP endpoint
});

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

// 2. WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: wsBaseUrl, // server WS endpoint
    connectionParams: {
      authToken: localStorage.getItem("token"), // auth for subs
    },
  })
);

// 3. Split based on operation type (query/mutation vs subscription)
const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return (
      def.kind === "OperationDefinition" && def.operation === "subscription"
    );
  },
  wsLink, // subscriptions go here
  authLink.concat(httpLink) // apply auth here for queries/mutations
);

// 4. Create client
export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
