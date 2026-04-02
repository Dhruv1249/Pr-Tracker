const { Router } = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const router = Router();
const CORE_SERVICE = process.env.CORE_SERVICE_URL;

const corePrefixes = ["/api/repos", "/api/prs", "/api/dashboard", "/api/webhooks", "/api/cli"];

for (const prefix of corePrefixes) {
    router.use(
        prefix,
        createProxyMiddleware({
            target: CORE_SERVICE,
            changeOrigin: true,
            on: {
                proxyReq: (proxyReq, req) => {
                    // Express strips the mount path from req.url, restore it
                    proxyReq.path = req.originalUrl;
                    // Forward the Authorization header from the request (token-based auth)
                    if (req.headers.authorization) {
                        proxyReq.setHeader('Authorization', req.headers.authorization);
                    }
                },
            },
        })
    );
}

module.exports = router;
