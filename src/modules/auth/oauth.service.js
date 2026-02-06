const axios = require("axios");
const redis = require("../../config/redis");

const TOKEN_KEY = "oauth:access_token";
const LOCK_KEY = "oauth:lock";

async function getAccessToken() {
  //Check Redis cache
  const cachedToken = await redis.get(TOKEN_KEY);
  if (cachedToken) {
    return cachedToken;
  }

  //Acquire Redis lock (prevent multiple refreshes)
  const lock = await redis.set(LOCK_KEY, "1", "NX", "EX", 5);
  if (!lock) {
    // Wait for the token to be refreshed by another request
    await new Promise((r) => setTimeout(r, 200));
    return getAccessToken();
  }

  try {
    //Call MOCK OAuth endpoint
    const response = await axios.post(
      process.env.OAUTH_TOKEN_URL,
      {},
      { timeout: 3000 }
    );

    const { access_token, expires_in } = response.data;

    //Cache token in Redis with TTL
    await redis.set(TOKEN_KEY, access_token, "EX", expires_in - 30);

    return access_token;
  } finally {
    //Release lock
    await redis.del(LOCK_KEY);
  }
}

module.exports = { getAccessToken };
