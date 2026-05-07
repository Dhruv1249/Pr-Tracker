const express = require("express");
const { Router } = express;

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

// POST /api/internal/verify-token → Service-to-service auth (parse JSON only for this route)
router.post("/api/internal/verify-token", express.json(), (req, res) => {
    const jwt = require("jsonwebtoken");
    const { token } = req.body || {};

    if (!token) return res.status(400).json({ error: "Token required" });

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ valid: false, error: "Internal server error" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            issuer: "pr-tracker-auth",
            audience: "pr-tracker-system"
        });
        res.json({ 
            valid: true, 
            user: {
                id: decoded.id,
                githubId: decoded.githubId,
                username: decoded.username
            }
        });
    } catch (err) {
        res.status(401).json({ valid: false, error: err.message });
    }
});

module.exports = router;
