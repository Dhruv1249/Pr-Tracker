const { Router } = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const router = Router();
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL;


router.get("/api/auth/success", (req, res) => {
    const token = req.query.token;

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    // Token in hash so client can store in localStorage (works even when 3rd-party cookies are blocked)
    res.status(302).set("Location", `${clientUrl}/auth/callback#token=${token}`).end();
});

router.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token", {
        path: "/",
        sameSite: "None",
        secure: true,
        httpOnly: true
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
});

router.use(
    "/api/auth",
    createProxyMiddleware({
        target: AUTH_SERVICE,
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req) => {
                proxyReq.path = req.originalUrl;
            },
        },
    })
);



router.use(
    "/api/users",
    createProxyMiddleware({
        target: AUTH_SERVICE,
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req) => {
                proxyReq.path = req.originalUrl;
            },
        },
    })
);

module.exports = router;
