// Description: Redis client setup using ioredis
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

module.exports = { redis };
