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
    
    // Prevent external spoofing of internal identity headers
    delete req.headers["x-user-id"];
    delete req.headers["x-user-github-id"];

    // ✅ Skip auth for preflight requests
    if (req.method === "OPTIONS") {
        return next();
    }

    // ✅ Fully public routes
    if (PUBLIC_ROUTES.some(route => req.originalUrl.startsWith(route))) {
        return next();
    }

    // ✅ Internal service-to-service calls via shared secret
    // Restrict internal bypass to specific allowed routes (e.g., DB operations)
    const isInternalAllowed = req.originalUrl.startsWith("/api/db/");
    if (isInternalAllowed) {
        if (INTERNAL_SECRET && req.headers["x-internal-secret"] === INTERNAL_SECRET) {
            // Identity headers (x-user-id, x-user-github-id) are already attached by the caller
            return next();
        } else {
            return res.status(403).json({ error: "Forbidden: Internal route" });
        }
    }

    let token;

    // Users must authenticate exclusively via the HttpOnly cookie
    if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    if (!process.env.JWT_SECRET) {
        console.error("CRITICAL: JWT_SECRET is not defined!");
        return res.status(500).json({ error: "Internal server error" });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET, {
            issuer: "pr-tracker-auth",
            audience: "pr-tracker-system"
        });
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = auth;
