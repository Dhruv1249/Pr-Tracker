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

// Synthesize an Authorization: Bearer header from cookie when no header auth exists.
// This ensures the AI agent always receives a Bearer token to forward on tool calls
// to the backend, regardless of whether the frontend used cookie or header auth.
function resolveAuthHeader(req) {
    if (req.headers.authorization) return req.headers.authorization;
    if (req.cookies?.token) return `Bearer ${req.cookies.token}`;
    return null;
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
                const auth = resolveAuthHeader(req);
                if (auth) {
                    proxyReq.setHeader('Authorization', auth);
                }
                if (req.headers.cookie) {
                    proxyReq.setHeader('Cookie', req.headers.cookie);
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
                const auth = resolveAuthHeader(req);
                if (auth) {
                    proxyReq.setHeader('Authorization', auth);
                }
                if (req.headers.cookie) {
                    proxyReq.setHeader('Cookie', req.headers.cookie);
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
                const auth = resolveAuthHeader(req);
                if (auth) {
                    proxyReq.setHeader('Authorization', auth);
                }
                if (req.headers.cookie) {
                    proxyReq.setHeader('Cookie', req.headers.cookie);
                }
            },
            proxyRes: stripCorsHeaders,
        },
    })
);

module.exports = router;
