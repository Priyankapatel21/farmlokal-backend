const axios = require("axios");
const { getAccessToken } = require("../auth/oauth.service");

async function callExternalApi() {
  const token = await getAccessToken();

  return axios.get("http://localhost:3000/mock/external/api", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 3000,
  });
}

module.exports = { callExternalApi };
