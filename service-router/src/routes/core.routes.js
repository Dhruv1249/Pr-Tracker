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
                    proxyReq.path = req.originalUrl;
                    if (req.user) {
                        proxyReq.setHeader('x-user-id', req.user.id);
                        proxyReq.setHeader('x-user-github-id', req.user.githubId);
                    }
                    // Do NOT forward raw credentials
                    proxyReq.removeHeader('Authorization');
                    proxyReq.removeHeader('Cookie');
                },
            },
        })
    );
}

module.exports = router;
