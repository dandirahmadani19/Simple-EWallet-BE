const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redisClient = require("../config/redis");
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');

// Middleware untuk generate cookie anonymous_id
const ensureAnonymousId = (req, res, next) => {
  if (!req.cookies.anonymous_id) {
    const anonId = uuidv4();
    res.cookie('anonymous_id', anonId, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
    req.anonymousId = anonId;
  } else {
    req.anonymousId = req.cookies.anonymous_id;
  }
  next();
};


const createRateLimiter = ({ windowMs, max, message }) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
    keyGenerator: (req, res) => req.anonymousId || req.ip,
    windowMs, // durasi jendela
    max, // jumlah maksimum request
    message, // pesan jika limit terlewati
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = {
  ensureAnonymousId,
  limiterTransfer: createRateLimiter({
    windowMs: 60 * 1000, // 1 menit
    max: 5,
    message: "Terlalu banyak transfer dalam 1 menit.",
  }),
  limiterLogin: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 menit
    max: 5,
    message: "Terlalu banyak percobaan login. Coba lagi nanti.",
  }),
};
