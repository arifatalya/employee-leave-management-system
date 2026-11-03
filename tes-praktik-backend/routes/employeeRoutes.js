import express from "express";
import { listEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee } from "../controllers/employeeController.js";
import { authenticate, authorize } from "../utils/authMiddleware.js";

const employeeRouter = express.Router();

employeeRouter.use(authenticate);

employeeRouter.get("/", authorize("ADMIN", "DIVISION_HEAD"), listEmployees);
employeeRouter.get("/:id", authorize("ADMIN", "DIVISION_HEAD"), getEmployee);

employeeRouter.post("/", authorize("ADMIN"), createEmployee);
employeeRouter.put("/:id", authorize("ADMIN"), updateEmployee);
employeeRouter.patch("/:id", authorize("ADMIN"), updateEmployee);
employeeRouter.delete("/:id", authorize("ADMIN"), deleteEmployee);

export default employeeRouter;
