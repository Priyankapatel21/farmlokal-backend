const redis = require("../config/redis");

const WINDOW_SECONDS = 60; // 1 minute
const MAX_REQUESTS = 50;

async function rateLimiter(req, res, next) {
  try {
    const ip = req.ip;
    const key = `rate:${ip}`;

    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    if (current > MAX_REQUESTS) {
      return res.status(429).json({
        error: "Too many requests. Please try again later.",
      });
    }

    next();
  } catch (err) {
    // Fail open (do not block traffic if Redis fails)
    next();
  }
}

module.exports = rateLimiter;
