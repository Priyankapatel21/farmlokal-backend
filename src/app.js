const express = require("express");
const pool = require("./config/mysql");
const redis = require("./config/redis");

const productRoutes = require("./modules/products/products.routes");
const externalRoutes = require("./modules/external/external.routes");
const webhookRoutes = require("./modules/webhooks/webhook.routes");
const rateLimiter = require("./middlewares/rateLimiter");


const app = express();
app.use(express.json());
app.use(rateLimiter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// MySQL test
app.get("/db-test", async (req, res) => {
  await pool.query("SELECT 1");
  res.json({ mysql: "connected" });
});

// Redis test
app.get("/redis-test", async (req, res) => {
  await redis.set("test", "working", "EX", 10);
  const val = await redis.get("test");
  res.json({ redis: val });
});

// 🔐 MOCK OAUTH TOKEN ENDPOINT
app.post("/mock/oauth/token", (req, res) => {
  console.log("✅ MOCK OAUTH HIT");
  res.json({
    access_token: "mock_access_token_" + Date.now(),
    expires_in: 3600,
    token_type: "Bearer",
  });
});

// 🌐 MOCK EXTERNAL API
app.get("/mock/external/api", (req, res) => {
  res.json({
    status: "success",
    message: "Mock external API response",
  });
});

// Routes
app.use("/products", productRoutes);
app.use("/external", externalRoutes);
app.use("/webhooks", webhookRoutes);

module.exports = app;
