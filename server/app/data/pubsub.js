const { RedisPubSub } = require("graphql-redis-subscriptions");
const { REDIS_URL } = require("../config/env");
const Redis = require("ioredis");
const redisClient = new Redis(REDIS_URL);

// Redis connection options
const options = {
  url: REDIS_URL,
  retryStrategy: (times) => Math.min(times * 50, 2000),
};

console.log('Redis Server is listening at: ', REDIS_URL);
// Create RedisPubSub instance
const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});

module.exports = { pubsub, redisClient };
