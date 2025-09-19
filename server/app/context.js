const {pubsub} = require("./data/pubsub");
const { prisma } = require("./data/prisma");
const { verifyToken } = require("./utils/auth");

// Context function to provide context to resolvers

const getContext = async ({ req, res }) => {
  const token = req.headers.authorization || null;

  const user = token ? verifyToken(token) : null;

  return {
    prisma, // DB client
    pubsub, // Redis pub/sub instance
    user, // Current authenticated user
    req,
    res, // Access request/response if needed
  };
};

module.exports = { getContext };
