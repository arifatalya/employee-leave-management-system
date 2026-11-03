import express from "express";
import { listLeaveRequests, listPendingRequests, getLeaveRequest, submitLeaveRequest, approveLeaveRequest, rejectLeaveRequest } from "../controllers/leaveRequestController.js";
import { authenticate, authorize } from "../utils/authMiddleware.js";

const leaveRouter = express.Router();

leaveRouter.use(authenticate);

leaveRouter.post("/", authorize("STAFF"), submitLeaveRequest);
leaveRouter.get("/", authorize("ADMIN", "STAFF", "DIVISION_HEAD"), listLeaveRequests);
leaveRouter.get("/pending", authorize("DIVISION_HEAD"), listPendingRequests);
leaveRouter.get("/:id", authorize("ADMIN", "STAFF", "DIVISION_HEAD"), getLeaveRequest);
leaveRouter.patch("/:id/approve", authorize("DIVISION_HEAD"), approveLeaveRequest);
leaveRouter.patch("/:id/reject", authorize("DIVISION_HEAD"), rejectLeaveRequest);

export default leaveRouter;
