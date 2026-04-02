const { Router } = require("express");

const router = Router();

// GET /api/health → Simple health check
router.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "api-gateway",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// POST /api/internal/verify-token → Service-to-service auth
router.post("/api/internal/verify-token", (req, res) => {
    const jwt = require("jsonwebtoken");
    const { token } = req.body || {};

    if (!token) return res.status(400).json({ error: "Token required" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true, decoded });
    } catch (err) {
        res.status(401).json({ valid: false, error: err.message });
    }
});

module.exports = router;
