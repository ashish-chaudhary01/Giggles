import express from "express";
import { getAuth } from "@clerk/express";
import checkAuth from "../controllers/auth.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/check", protectRoute, checkAuth);

export default router;
