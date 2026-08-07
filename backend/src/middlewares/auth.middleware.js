import userModel from "../models/user.model.js";
import { getAuth } from "@clerk/express";

export default function protectRoute(req, res, next) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({
        message: "Unauthorized",
      });
    }
    const user = userModel.findOne({ clerkId: userId });
    if (!user) {
      res.status(404).json({
        message: "user not found",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("error in protectRoute middleware", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}
