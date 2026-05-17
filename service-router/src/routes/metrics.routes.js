const express = require("express");
const client = require("prom-client");

const router = express.Router();

// Collect default Node.js metrics (heap, GC, event loop lag, etc.)
const register = client.register;
client.collectDefaultMetrics({ register });

// Custom HTTP request counter
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

// Custom HTTP response duration histogram
const httpRequestDurationMs = new client.Histogram({
  name: "http_request_duration_ms",
  help: "HTTP request duration in milliseconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [10, 50, 100, 200, 500, 1000, 2000],
});

// Middleware to track all requests — attach to app in index.js
const metricsMiddleware = (req, res, next) => {
  // Skip the /metrics endpoint itself to avoid noise
  if (req.path === "/metrics") return next();

  const end = httpRequestDurationMs.startTimer();
  res.on("finish", () => {
    const route = req.route ? req.baseUrl + req.route.path : req.path;
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode,
    };
    httpRequestsTotal.inc(labels);
    end(labels);
  });
  next();
};

// GET /metrics — Prometheus scrape endpoint (no auth, no rate limit)
router.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

module.exports = { router, metricsMiddleware };
