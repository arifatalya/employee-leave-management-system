import express from "express";
import userLogin from "../controllers/authController.js";
import { authenticate } from "../utils/authMiddleware.js";
import rateLimit from "express-rate-limit";

const authRouter = express.Router();

const loginLimiter = rateLimit({
    windowMs: 20 * 60 * 1000,
    max: 10,
    message: "Slow down.",
    standardHeaders: true,
    legacyHeaders: false,
});

authRouter.post("/login", userLogin);

authRouter.get("/me", authenticate, (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            user: req.user
        }
    });
});

export default authRouter;