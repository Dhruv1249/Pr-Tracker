require("dotenv").config();

const express = require("express");
const cors = require("cors");

const auth = require("./middleware/auth");
const authRoutes = require("./routes/auth.routes");
const coreRoutes = require("./routes/core.routes");
const aiRoutes = require("./routes/ai.routes");
const dbRoutes = require("./routes/db.routes");
const healthRoutes = require("./routes/health.routes");
const cookieParser = require("cookie-parser");

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT;

app.use(cookieParser())

const clientUrl = process.env.CLIENT_URL;
if (!clientUrl || clientUrl === "*") {
    console.error("CRITICAL: CLIENT_URL must be a specific origin. Refusing to start.");
    process.exit(1);
}

app.use(cors({ 
    origin: clientUrl, 
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-pr-tracker-csrf']
}));
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});

app.use(limiter);

const csrfProtection = (req, res, next) => {
    // Exempt internal service-to-service calls from CSRF checks
    const internalSecret = req.headers['x-internal-secret'];
    if (internalSecret && internalSecret === process.env.INTERNAL_SECRET) {
        return next();
    }

    if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
        // Exempt webhooks which come from GitHub, not the browser
        if (!req.originalUrl.startsWith("/api/webhooks")) {
            if (!req.headers['x-pr-tracker-csrf']) {
                return res.status(403).json({ error: "CSRF verification failed. Missing x-pr-tracker-csrf header." });
            }
        }
    }
    next();
};
app.use(csrfProtection);

app.use(auth);

app.use((req,res,next)=>{
  console.log("gateway req.user:", req.user);
  next();
});

app.use(healthRoutes);

app.use(authRoutes);
app.use(dbRoutes);
app.use(coreRoutes);
app.use(aiRoutes);

app.use("/api/*", (req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});
    
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`\n  API Gateway running on http://localhost:${PORT}`);
    console.log(`  Auth Service   → ${process.env.AUTH_SERVICE_URL}`);
    console.log(`  Core Service   → ${process.env.CORE_SERVICE_URL}`);
    console.log(`  AI Service     → ${process.env.AI_SERVICE_URL}`);
    console.log(`  DB Service     → ${process.env.DB_SERVICE_URL}\n`);
});
