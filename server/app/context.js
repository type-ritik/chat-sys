// const { pubsub } = require("./data/pubsub");
// const { prisma } = require("./data/prisma");
const { GraphQLError } = require("graphql");
const { verifyToken } = require("./utils/auth");

// Context function to provide context to resolvers

const getContext = async ({ req, res }) => {
  const myToken = req.headers.authorization || null;
  const token = myToken ? myToken.replace("Bearer ", "") : null;

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
    console.log("error")
    return {
      user: null,
      authError: error.name,
    };
  }
};

module.exports = { getContext };
