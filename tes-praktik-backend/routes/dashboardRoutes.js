import express from "express";
import { authenticate } from "../utils/authMiddleware.js";
import { getDashboardSummary } from "../controllers/dashboardController.js";

const dashboardRouter = express.Router();

dashboardRouter.use(authenticate);

dashboardRouter.get("/summary", getDashboardSummary);

export default dashboardRouter;