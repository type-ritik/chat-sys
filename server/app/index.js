// Express Server - Entry point for HTTP
const express = require("express");

// Cross-site
const cors = require("cors");

// Apollo Server exposes '/graphql'
const { ApolloServer } = require("@apollo/server");

// Body parser
const bodyParser = require("body-parser");

// Apollo integration for express middleware
const { expressMiddleware } = require("@as-integrations/express4");

// Query and Mutation schema - TypeDefs
const { typeDefs } = require("./schema");

// For logic behind Query and Mutation
const { resolvers } = require("./resolvers");

// Context for Apollo Server
const { getContext } = require("./context");

// Start Http and Apollo server
async function startServer() {
  const app = express();

  // Apollo Server setup
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: getContext,
  });

  await server.start();
  app.use(
    "/graphql",
    cors(),
    express.json(),
    bodyParser.json(),
    expressMiddleware(server)
  );

  return app;
}

module.exports = { startServer };
