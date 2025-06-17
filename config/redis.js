// config/redis.js
const Redis = require('ioredis');

const redisClient = new Redis({
  host: 'localhost',
  port: 6379,
  // password: process.env.REDIS_PASSWORD (jika ada)
});

module.exports = redisClient;
