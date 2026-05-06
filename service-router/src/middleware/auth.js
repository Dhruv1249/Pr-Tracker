const jwt = require("jsonwebtoken");

// Routes that are fully public (no auth needed)
const PUBLIC_ROUTES = [
    "/api/auth/success",
    "/api/auth/github",
    "/api/auth/github/callback",
    "/api/health",
    "/api/webhooks/github",
    "/api/internal/verify-token", // Internal token verification
];

const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

function auth(req, res, next) {
    console.log(`[auth] req.method: ${req.method}, req.originalUrl: ${req.originalUrl}`);
    // ✅ Skip auth for preflight requests
    if (req.method === "OPTIONS") {
        return next();
    }

    // ✅ Fully public routes
    if (PUBLIC_ROUTES.some(route => req.originalUrl.startsWith(route))) {
        return next();
    }

    // ✅ Internal service-to-service calls via shared secret
    //    Used by the backend (webhooks, sync) when there's no browser JWT.
    //    If the call ALSO carries a valid Authorization header (e.g. backend
    //    forwarding a browser request), still verify it so req.user is set
    //    and x-user-id gets forwarded to the MongoDB service.
    if (INTERNAL_SECRET && req.headers["x-internal-secret"] === INTERNAL_SECRET) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            try {
                req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
            } catch (_) { /* internal call — proceed even if JWT is absent/invalid */ }
        }
        return next();
    }

    // Allow user creation from auth service (internal, not browser-originated)
    if (req.originalUrl === "/api/db/users" && req.method === "POST") {
        return next();
    }

    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }

    // Also accept token from cookie (set by the auth service on login)
    if (!token && req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = auth;
