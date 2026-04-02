const { Router } = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const router = Router();
const DB_SERVICE = process.env.DB_SERVICE_URL;

// MongoDB Data Service
// /api/repositories, /api/pullrequests, /api/reviews → MongoDB service directly
const dbPrefixes = ["/api/repositories", "/api/pullrequests", "/api/reviews"];

for (const prefix of dbPrefixes) {
    router.use(
        prefix,
        createProxyMiddleware({
            target: DB_SERVICE,
            changeOrigin: true,
            on: {
                proxyReq: (proxyReq, req) => {
                    proxyReq.path = req.originalUrl;
                    // Forward the authenticated user's MongoDB _id to the DB service
                    const userId = req.user?.id;
                    if (userId) {
                        proxyReq.setHeader("x-user-id", userId);
                    }
                },
            },
        })
    );
}

router.use(
    "/api/db/users",
    createProxyMiddleware({
        target: DB_SERVICE,
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req) => {
                const userId = req.user?.id;
                if (userId) {
                    proxyReq.setHeader("x-user-id", userId);
                }

                proxyReq.path = `/api/users${req.url}`;
            },
        },
    })
);

module.exports = router;
