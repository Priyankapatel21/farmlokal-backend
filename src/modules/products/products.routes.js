const express = require("express");
const router = express.Router();
const pool = require("../../config/mysql");
const redis = require("../../config/redis");

router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor;

    const { category, minPrice, maxPrice, search } = req.query;

    // 🔑 Build cache key
    const cacheKey = [
  "products",
  category || "",
  minPrice || "",
  maxPrice || "",
  search || "",
  cursor || "",
  limit,
].join(":");


    //Check Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json({ ...JSON.parse(cachedData), cached: true });
    }

    //Build SQL query
    let query = `
      SELECT id, name, description, category, price, created_at
      FROM products
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    if (minPrice) {
      query += " AND price >= ?";
      params.push(minPrice);
    }

    if (maxPrice) {
      query += " AND price <= ?";
      params.push(maxPrice);
    }

    if (search) {
      query += " AND name LIKE ?";
      params.push(`%${search}%`);
    }

    if (cursor) {
      const [createdAt, id] = cursor.split("_");
      query += `
        AND (
          created_at < ?
          OR (created_at = ? AND id < ?)
        )
      `;
      params.push(createdAt, createdAt, id);
    }

    query += `
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `;
    params.push(limit);

    const [rows] = await pool.query(query, params);

    let nextCursor = null;
    if (rows.length === limit) {
      const last = rows[rows.length - 1];
      nextCursor = `${last.created_at.toISOString()}_${last.id}`;
    }

    const response = {
      data: rows,
      nextCursor,
      cached: false,
    };

    //Store in Redis (TTL = 60 seconds)
    await redis.set(cacheKey, JSON.stringify(response), "EX", 60);

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

module.exports = router;
