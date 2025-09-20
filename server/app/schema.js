const { gql } = require("graphql-tag");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    username: String!
    isAdmin: Boolean!
    createdAt: String!
    token: String!
  }

  type Message {
    id: ID!
    content: String!
    sender: String!
    createdAt: String!
  }

  type Query {
    messages: [Message!]!
    loginUser(email: String!, password: String!): User!
    hello: String!
  }

  type Mutation {
    sendMessage(content: String!, sender: String!): Message!
    createUser(name: String!, email: String!, password: String!): User!
  }

  type Subscription {
    messageSent: Message!
  }
`;

module.exports = { typeDefs };
