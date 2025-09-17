const {RedisPubSub} = require('graphql-redis-subscriptions');
const Redis = require('ioredis');

// Redis connection options
const options = {host: process.env.REDIS_HOST, port: process.env.REDIS_PORT, retryStrategy: times => Math.min(times * 50, 2000)};

// Create RedisPubSub instance
const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options)
});

module.exports = {pubsub};
