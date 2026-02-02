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

// Redis Client
const { redisClient } = require("./data/pubsub");

// Start Http and Apollo server
async function startServer() {
  const app = express();

  // Increase the size of json
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Apollo Server setup
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  redisClient.on("connecting", () => {
    console.log("Connecting to Redis server...");
  });

  redisClient.on("connect", () => {
    console.log("Connected to Redis server");
  });

  redisClient.on("error", (error) => {
    console.error("Redis connection error:", error);
  });

  redisClient.on("ready", () => {
    console.log("Redis connection is ready");
  });

  redisClient.on("close", () => {
    console.log("Redis connection closed");
  });

  await server.start();
  app.use(
    "/graphql",
    cors(),
    express.json(),
    bodyParser.json(),
    expressMiddleware(server, { context: getContext }),
  );

  return app;
}

module.exports = { startServer };
