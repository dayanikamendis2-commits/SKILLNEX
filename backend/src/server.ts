import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import dashboardRoutes from "./routes/dashboard";
import jobRoutes from "./routes/jobs";

export const prisma = new PrismaClient();
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 80 }), authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/jobs", jobRoutes);
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "SKILLNEX API" }));

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`SKILLNEX API running on http://localhost:${port}`));
