const express = require("express");
const router = express.Router();
const redis = require("../../config/redis");

router.post("/order-updated", async (req, res) => {
  const { event_id, order_id, status } = req.body;

  if (!event_id) {
    return res.status(400).json({ error: "event_id is required" });
  }

  const idempotencyKey = `webhook:event:${event_id}`;

  const alreadyProcessed = await redis.get(idempotencyKey);
  if (alreadyProcessed) {
    return res.json({ message: "Event already processed" });
  }

  console.log("Processing order update:", order_id, status);

  await redis.set(idempotencyKey, "done", "EX", 3600);

  res.json({ message: "Event processed successfully" });
});

module.exports = router;
