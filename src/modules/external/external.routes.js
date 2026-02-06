const express = require("express");
const router = express.Router();
const { callExternalApi } = require("./external.service");

router.get("/test", async (req, res) => {
  const response = await callExternalApi();
  res.json(response.data);
});

module.exports = router;
