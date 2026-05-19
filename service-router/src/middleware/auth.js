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

    // ✅ Internal service-to-service calls via shared secret
    const authHeader = (req.headers['authorization'] || '').toString();
    let hasInternalSecret = false;
    if (INTERNAL_SECRET) {
        if (req.headers['x-internal-secret'] === INTERNAL_SECRET) {
            hasInternalSecret = true;
        } else if (authHeader.toLowerCase().startsWith('bearer ') && authHeader.slice(7) === INTERNAL_SECRET) {
            // Support Prometheus bearerTokenSecret which sends Authorization: Bearer <token>
            hasInternalSecret = true;
        }
    }

    if (hasInternalSecret) {
        // Trusted internal services can bypass auth and provide their own identity headers
        return next();
    }

    // 🔒 External requests: Prevent spoofing of internal identity headers
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
