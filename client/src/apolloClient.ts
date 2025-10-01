import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { baseUrl, wsBaseUrl } from "./config";

// 1. HTTP link for queries & mutation
const httpLink = new HttpLink({
  uri: baseUrl, // server HTTP endpoint
});

// 2. WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: wsBaseUrl, // server WS endpoint
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
  httpLink // queries & mutations go here
);

// 4. Create client
export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
