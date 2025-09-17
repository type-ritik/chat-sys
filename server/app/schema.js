const { gql } = require("graphql-tag");

const typeDefs = gql`
  type Message {
    id: ID!
    content: String!
    sender: String!
    createdAt: String!
  }

  type Query {
    messages: [Message!]!
    hello: String!
  }

  type Mutation {
    sendMessage(content: String!, sender: String!): Message!
  }

  type Subscription {
    messageSent: Message!
  }
`;

module.exports = { typeDefs };
