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
const { verifyToken } = require("./app/utils/auth");
const { onlineUsers } = require("./app/structure/OnlineUser");

async function main() {
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

  useServer(
    {
      schema,
      onDisconnect: (ctx, code, reason) => {
        const tokenDetail = ctx.connectionParams.authoriation;
        if (!tokenDetail) {
          console.log("Disconnect without token");
          return null;
        }

        const token = tokenDetail.startsWith("Bearer ")
          ? tokenDetail.split(" ")[1]
          : tokenDetail;

        const user = verifyToken(token);

        if (!user) {
          console.log("Disconnect without valid user");
          return;
        }

        console.log("userData: ", user);

        const userId = user.userId;

        if (onlineUsers.findUser(userId)) {
          onlineUsers.removeUser(userId);
        }
        console.log("User is Offline:", userId);
      },
      onSubscribe: (ctx) => {
        const tokenDetail = ctx.connectionParams.authorization;
        if (!tokenDetail) {
          throw new Error("Unauthorized");
        }

        const token = tokenDetail.startsWith("Bearer ")
          ? tokenDetail.split(" ")[1]
          : tokenDetail;

        const user = verifyToken(token);

        if (!user) {
          console.log("Unauthorized subscription attempt");
          throw new Error("Unauthorized");
        }

        console.log("userData: ", user);

        const userId = user.userId;

        onlineUsers.addUser(userId);
        console.log("User is Online:", userId);
      },
      context: async (ctx, msg, args) => {
        const tokenDetail = ctx.connectionParams.authorization;
        if (!tokenDetail) {
          throw new Error("Unauthorized");
        }

        const token = tokenDetail.startsWith("Bearer ")
          ? tokenDetail.split(" ")[1]
          : tokenDetail;

        const user = verifyToken(token);
        if (!user) {
          console.log("Invalid auth token for subscription");
          throw new Error("Unauthorized");
        }
        return {
          user, // Add authenticated user to context for resolvers
        };
      },
    },
    wsServer,
  );

  // Start the server
  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/graphql`);
    console.log(`Subscriptions are running on ws://localhost:${PORT}/graphql`);
  });
}

main().catch((err) => {
  console.error("Server failed to start", err);
});
