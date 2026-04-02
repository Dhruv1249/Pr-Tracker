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
const PORT = process.env.PORT;

app.use(cookieParser())

app.use(cors({ 
    origin: process.env.CLIENT_URL, 
    credentials: true 
}));
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
