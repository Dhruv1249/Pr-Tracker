const jwt = require("jsonwebtoken");

// Routes that are fully public (no auth needed)
const PUBLIC_ROUTES = [
    "/api/auth/success",
    "/api/auth/github",
    "/api/auth/github/callback",
    "/api/health",
    "/api/webhooks/github",
    "/api/db/users/github",   // Auth service lookups by githubId (internal only)
];

// Internal service-to-service data routes: allow GET (reads) without auth,
// but require auth for mutations (POST/PUT/PATCH/DELETE) so external callers
// cannot modify PR/review data without a valid JWT.
const INTERNAL_READONLY_PREFIXES = [
    "/api/pullrequests",
    "/api/reviews",
];

const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

function auth(req, res, next) {
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
    if (INTERNAL_SECRET && req.headers["x-internal-secret"] === INTERNAL_SECRET) {
        return next();
    }

    // ✅ Internal data service: allow unauthenticated GETs (backend→mongodb reads),
    //    but require a token for any write operation.
    if (
        INTERNAL_READONLY_PREFIXES.some(prefix => req.originalUrl.startsWith(prefix)) &&
        req.method === "GET"
    ) {
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
