# FarmLokal Backend

Scalable Node.js backend for FarmLokal featuring Redis caching, OAuth2 client credentials, cursor-based pagination, webhook idempotency, and rate limiting.

---

## Table of Contents
- Project Overview
- Tech Stack
- Architecture
- Authentication
- Product Listing API
- Caching Strategy
- Performance & Reliability
- Trade-offs
- Setup
- Deployment

## 📌 Project Overview

This project is a backend service developed as part of the **FarmLokal backend engineering assignment**.  
It focuses on implementing core backend concepts such as handling large datasets, integrating with external APIs, implementing OAuth2 authentication, optimizing performance using Redis, and ensuring reliable request handling.

The backend exposes a **performance-critical product listing API**, integrates with **external APIs (synchronous and webhook-based)**, and applies multiple reliability patterns such as **caching, rate limiting, idempotency, and concurrency-safe token handling**.

---

## 🛠 Tech Stack

- **Node.js (JavaScript)**
- **Express.js**
- **MySQL** – primary data store
- **Redis** – caching, rate limiting, idempotency, token storage
- **Axios** – external API calls
- **Render** – deployment platform

---

## 🧱 High-Level Architecture

```
Client
  ↓
Express API
  ├── Product Listing API (MySQL + Redis cache)
  ├── OAuth2 Token Service (Redis-backed)
  ├── External API Integrations
  ├── Webhook Handler (Idempotent)
  └── Rate Limiter (Redis)
```

The application follows a **modular structure**, separating concerns into:

- `modules/` for features (products, auth, external, webhooks)
- `config/` for infrastructure (MySQL, Redis)
- `middlewares/` for cross-cutting concerns (rate limiting)

---

## 🔐 Authentication – OAuth2 Client Credentials Flow

### Approach

The service implements **OAuth2 Client Credentials flow** using a **mock OAuth server**, which is explicitly allowed by the assignment.

### Implementation Details

- Access tokens are fetched from a mock OAuth token endpoint.
- Tokens are cached in Redis with TTL based on `expires_in`.
- A Redis-based lock ensures that concurrent requests do not trigger multiple token fetches (prevents token stampede).
- Token lifecycle is handled centrally in a single service.

### Why Mock OAuth?

For local development and reliability, a mock OAuth provider is used to avoid dependency on third-party configuration or downtime.  
The implementation still follows real OAuth2 semantics and can be switched to providers like **Auth0** or **Okta** by changing environment variables only.

---

## 🌐 External API Integrations

### API A – Synchronous External API

- Simulates fetching product/order-like data.
- Uses Axios with:
  - Timeout handling
  - Retry strategy (exponential backoff – configurable)
- OAuth2 access token is attached to requests.

This demonstrates safe handling of **slow or unreliable external services**.

---

### API B – Webhook / Callback-Based API

- **Endpoint:** `POST /webhooks/order-updated`
- Handles asynchronous updates from an external system.

#### Reliability Features

- Idempotency using Redis (`event_id` as idempotency key)
- Duplicate events are safely ignored
- Supports safe retries from webhook providers

This ensures **exact-once processing semantics**.

---

## 📦 Product Listing API (Performance Critical)

### Endpoint

```
GET /products
```

### Features

- **Cursor-based pagination** (using `created_at + id`)
- **Filtering**
  - Category
  - Price range
- **Search**
  - Product name
- **Sorting**
  - Optimized for recency (`created_at`)
- **Redis caching** for frequent read queries

### Why Cursor-Based Pagination?

Offset-based pagination becomes inefficient for large datasets.  
Cursor-based pagination:

- Uses indexed columns
- Avoids scanning skipped rows
- Provides consistent performance for large datasets (1M+ records)

---

## 🗄 Database Design & Indexing

### MySQL Index Strategy

- Composite index on `(created_at, id)` for pagination
- Indexes on `category` and `price` for filtering

### Large Dataset Simulation

While not physically seeding 1M+ rows, the schema, indexes, and pagination strategy are **designed to scale efficiently** for large datasets.

---

## ⚡ Caching Strategy (Redis)

### What Is Cached?

- Product listing responses
- OAuth2 access tokens
- Webhook idempotency keys
- Rate limit counters

### Cache Invalidation

- TTL-based invalidation
- Short TTL for product listings to balance freshness and performance
- Token TTL aligned with OAuth expiry

---

## 🚦 Rate Limiting

- Implemented using Redis
- IP-based request limiting
- Configurable limits (e.g., 50 requests per minute per IP)
- Automatically resets using Redis TTL
- Fails open if Redis is unavailable to avoid blocking traffic

---

## 🛡 Reliability & Performance Techniques Used

The system prioritizes **low latency and high reliability**.

Implemented techniques:

- ✅ Redis caching
- ✅ Rate limiting
- ✅ Idempotent webhook handling
- ✅ OAuth token deduplication with locking
- ✅ Timeout handling for external APIs
- ✅ Connection pooling via MySQL client

These techniques ensure minimal database load and predictable response times.

---

## ⚖ Trade-offs & Design Decisions

### Mock OAuth Provider
- Chosen for reliability and faster development
- Easily replaceable with real providers in production

### TTL-based Cache Invalidation
- Simpler and safer than manual invalidation

### Cursor Pagination
- Preferred over OFFSET for scalability

### Fail-open Rate Limiting
- Ensures availability even if Redis is temporarily unavailable

---

## 🧪 Local Setup Instructions

### Prerequisites

- Node.js
- MySQL
- Redis

### Steps

```bash
git clone https://github.com/Priyankapatel21/farmlokal-backend.git
cd farmlokal-backend
npm install
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
REDIS_URL=redis://127.0.0.1:6379

# Mock OAuth Configuration
OAUTH_CLIENT_ID=dummy
OAUTH_CLIENT_SECRET=dummy
OAUTH_AUDIENCE=dummy
OAUTH_TOKEN_URL=http://localhost:3000/mock/oauth/token

Database connection variables are configured locally for development and provided via environment variables in Render for deployment.
```

Run the server:

```bash
npm start
```

---

## 🚀 Deployment
The backend is deployed on Render.

Deployed URL:
👉 https://farmlokal-backend-eh8h.onrender.com/

## 🔗 API Endpoints (Deployed)

### Health Check
GET /health  
https://farmlokal-backend-eh8h.onrender.com/health

### Product Listing
GET /products  
https://farmlokal-backend-eh8h.onrender.com/products

### External API Test
GET /external/test  
https://farmlokal-backend-eh8h.onrender.com/external/test

### Webhook Endpoint (POST only)
POST /webhooks/order-updated  
https://farmlokal-backend-eh8h.onrender.com/webhooks/order-updated

---

## ✅ Conclusion
This project demonstrates real-world backend engineering practices, focusing on:
- Performance  
- Scalability  
- Reliability  
- Clean architecture  
- Clear documentation  

👤 Author
Priyanka Patel
