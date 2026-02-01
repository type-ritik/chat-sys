const { RedisPubSub } = require("graphql-redis-subscriptions");
const { REDIS_URL } = require("../config/env");
const Redis = require("ioredis");
const redisClient = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null
});

// Redis connection options
const options = {
  url: process.env.REDIS_URL,
  retryStrategy: null,
};

console.log('Redis Server is listening at: ', process.env.REDIS_URL);
// Create RedisPubSub instance
const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});

module.exports = { pubsub, redisClient };
