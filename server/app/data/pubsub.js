const { RedisPubSub } = require("graphql-redis-subscriptions");
const { REDIS_URL } = require("../config/env");
require("dotenv").config();
const Redis = require("ioredis");

// Redis connection options
const redisConfig = {
  // Use the env var, or fallback to local ONLY in dev
  connectionString: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  maxRetriesPerRequest: null, // Prevents the crash you saw
  retryStrategy(times) {
    console.warn(`Retrying Redis connection: attempt ${times}`);
    return Math.min(times * 50, 2000);
  }
};

const redisClient = new Redis(redisConfig.connectionString, redisConfig);

console.log('Redis Server is listening at: ', process.env.REDIS_URL);
// Create RedisPubSub instance
const pubsub = new RedisPubSub({
  publisher: new Redis(redisConfig.connectionString, redisConfig),
  subscriber: new Redis(redisConfig.connectionString, redisConfig),
});

module.exports = { pubsub, redisClient };
