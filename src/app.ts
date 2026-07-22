import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import routes from "./routes";
import { apiLimiter, errorHandler } from "./middleware";
import connectDB from "./db";

dotenv.config();

connectDB().catch((err) => console.error("MongoDB connection failed:", err));

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000").split(",").map((s) => s.trim());
app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)), credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api", apiLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1", routes);

app.use(errorHandler);

export default app;
