// const { pubsub } = require("./data/pubsub");
// const { prisma } = require("./data/prisma");
const { GraphQLError } = require("graphql");
const { verifyToken } = require("./utils/auth");

// Context function to provide context to resolvers

const getContext = async ({ req, res }) => {
  const token = req.headers.authorization || null;

  try {
    if (req.body.operationName == "CreateNewAccessToken") {
      return {
        // prisma, // DB client
        // pubsub, // Redis pub/sub instance
        // Current authenticated user
        req,
        res, // Access request/response if needed
      };
    } else {
      const user = token ? verifyToken(token) : null;

      return {
        // prisma, // DB client
        // pubsub, // Redis pub/sub instance
        user, // Current authenticated user
        req,
        res, // Access request/response if needed
      };
    }
  } catch (error) {
    if (error.message === "TOKEN EXPIRES") {
      console.log("Error TOKEN EXPIRES: ", error.message);
      throw new GraphQLError("Unauthorized", {
        extensions: {
          code: "UNAUTHORIZED",
          http: { status: 401 },
        },
      });
    }
    throw new Error(error.message);
  }
};

module.exports = { getContext };
