const http = require("http");
const { startServer } = require("./app/index");
const { PORT } = require("./app/config/env");
// const { connectToDatabase } = require("./app/data/db");
// For subscriptions (graphql-ws)
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");

const { typeDefs } = require("./app/schema");
const { resolvers } = require("./app/resolvers");

async function main() {
  // Connect to Database
  // await connectToDatabase();

  // Start Express + Apollo
  const app = await startServer();

  // Create HTTP server
  const httpServer = http.createServer(app);

  // Create GraphQL schema for both HTTP and WebSocket
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Set up WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  useServer({ schema }, wsServer);

  // Start the server
  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/graphql`);
    console.log(`Subscriptions are running on ws://localhost:${PORT}/graphql`);
  });
}

main().catch((err) => {
  console.error("Server failed to start", err);
});
