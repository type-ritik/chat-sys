const { RedisPubSub } = require("graphql-redis-subscriptions");
const { REDIS_URL } = require("../config/env");
require("dotenv").config();
const Redis = require("ioredis");

// Redis connection options
const options = {
  url: process.env.REDIS_URL,
  retryStrategy: times => Math.min(times * 50, 2000),
};

const redisClient = new Redis(options);

console.log('Redis Server is listening at: ', process.env.REDIS_URL);
// Create RedisPubSub instance
const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});

module.exports = { pubsub, redisClient };
