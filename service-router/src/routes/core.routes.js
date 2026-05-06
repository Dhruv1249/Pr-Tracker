const { Router } = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const router = Router();
const CORE_SERVICE = process.env.CORE_SERVICE_URL;

const corePrefixes = ["/api/repos", "/api/prs", "/api/dashboard", "/api/webhooks", "/api/cli"];

// Helper: resolve the best Authorization header value.
// If the request already has a Bearer token, use it.
// If the user authenticated via cookie, synthesize a Bearer header from it
// so downstream services (backend) always get a proper token to work with.
function resolveAuthHeader(req) {
    if (req.headers.authorization) return req.headers.authorization;
    if (req.cookies?.token) return `Bearer ${req.cookies.token}`;
    return null;
}

for (const prefix of corePrefixes) {
    router.use(
        prefix,
        createProxyMiddleware({
            target: CORE_SERVICE,
            changeOrigin: true,
            on: {
                proxyReq: (proxyReq, req) => {
                    proxyReq.path = req.originalUrl;
                    const auth = resolveAuthHeader(req);
                    if (auth) {
                        proxyReq.setHeader('Authorization', auth);
                    }
                },
            },
        })
    );
}

module.exports = router;
