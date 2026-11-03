import express from "express";
import cors from "cors";
import errorHandler from "./utils/errorHandler.js";
import authRouter from "./routes/authRoutes.js";
import employeeRouter from "./routes/employeeRoutes.js";
import divisionRouter from "./routes/divisionRoutes.js";
import leaveRequestRouter from "./routes/leaveRequestRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";

const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://8omata.vercel.app', 'https://mockgen8n.vercel.app'],
    credentials: true
}));

app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/employees", employeeRouter);
app.use("/api/v1/divisions", divisionRouter);
app.use("/api/v1/leave-requests", leaveRequestRouter);
app.use("/api/v1/dashboard", dashboardRouter);

app.use(errorHandler);

export default app;