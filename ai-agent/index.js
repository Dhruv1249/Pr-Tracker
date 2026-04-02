import "dotenv/config";
import express from "express";
import cors from "cors";
import aiRoutes from "./routes/ai.route.js";
import riskRoutes from "./routes/risk.route.js";
import securityRoutes from "./routes/security.route.js";

const app = express();

app.use(express.json());


app.use(cors({ origin: process.env.PROXY_URL, credentials: true }));
app.use(aiRoutes);
app.use(riskRoutes);
app.use(securityRoutes);


const Port = process.env.PORT || 5001;

app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});
