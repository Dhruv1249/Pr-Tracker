const { Router } = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const router = Router();
const AI_SERVICE = process.env.AI_SERVICE_URL;

// Strip CORS headers from the AI agent's response so only the gateway's CORS applies
function stripCorsHeaders(proxyRes) {
    delete proxyRes.headers["access-control-allow-origin"];
    delete proxyRes.headers["access-control-allow-credentials"];
    delete proxyRes.headers["access-control-allow-methods"];
    delete proxyRes.headers["access-control-allow-headers"];
}

// All AI routes go to the AI agent — restore full path so the agent sees /api/ai/*
router.use(
    "/api/ai",
    createProxyMiddleware({
        target: AI_SERVICE,
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req) => {
                proxyReq.path = req.originalUrl;
                // Forward the Authorization header from the request (token-based auth)
                if (req.headers.authorization) {
                    proxyReq.setHeader('Authorization', req.headers.authorization);
                }
            },
            proxyRes: stripCorsHeaders,
        },
    })
);

// /api/risk and /api/security are aliases pointing to AI agent routes at /api/ai/risk and /api/ai/security
router.use(
    "/api/risk",
    createProxyMiddleware({
        target: AI_SERVICE,
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req) => {
                proxyReq.path = req.originalUrl.replace("/api/risk", "/api/ai/risk");
                if (req.headers.authorization) {
                    proxyReq.setHeader('Authorization', req.headers.authorization);
                }
            },
            proxyRes: stripCorsHeaders,
        },
    })
);

router.use(
    "/api/security",
    createProxyMiddleware({
        target: AI_SERVICE,
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req) => {
                proxyReq.path = req.originalUrl.replace("/api/security", "/api/ai/security");
                if (req.headers.authorization) {
                    proxyReq.setHeader('Authorization', req.headers.authorization);
                }
            },
            proxyRes: stripCorsHeaders,
        },
    })
);

module.exports = router;
