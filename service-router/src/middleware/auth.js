const jwt = require("jsonwebtoken");

// Routes that don't need authentication
const PUBLIC_ROUTES = [
    "/api/auth/success",
    "/api/auth/github",
    "/api/auth/github/callback",
    "/api/health",
    "/api/webhooks/github",
    // Internal service-to-service routes (data service, AI)
    "/api/pullrequests",
    "/api/reviews",
    "/api/db/users/github",   // Auth service lookups by githubId
];

function auth(req, res, next) {
    // ✅ Skip auth for public routes
    if (req.method === "OPTIONS") {
        return next();
    }

    if (PUBLIC_ROUTES.some(route => req.originalUrl.startsWith(route))) {
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
