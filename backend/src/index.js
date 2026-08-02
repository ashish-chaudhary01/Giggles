import express from "express";
import "dotenv/config";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./lib/db.js";
import dns from "dns";

//
dns.setServers(["0.0.0.0", "8.8.8.8"]);
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const app = express();

// middlewares
app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(clerkMiddleware());

//
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

// server start
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port: ${PORT}`);
});
