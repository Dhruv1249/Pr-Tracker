require("dotenv").config();
const express = require("express");
const cors = require("cors");

const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");


const app = express();

// Cloud Run / reverse proxy support
app.set("trust proxy", 1);

// CORS for Vercel frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

const repoRoutes = require('./routes/repoRoutes')



app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);

app.use("/api", repoRoutes);


module.exports = app;
