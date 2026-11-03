import express from "express";
import { listDivisions, getDivision, createDivision, updateDivision, deleteDivision } from "../controllers/divisionController.js";
import { authenticate, authorize } from "../utils/authMiddleware.js";

const divisionRouter = express.Router();

divisionRouter.use(authenticate);

divisionRouter.get("/", listDivisions);
divisionRouter.get("/:id", getDivision);
divisionRouter.post("/", authorize("ADMIN"), createDivision);
divisionRouter.put("/:id", authorize("ADMIN"), updateDivision);
divisionRouter.patch("/:id", authorize("ADMIN"), updateDivision);
divisionRouter.delete("/:id", authorize("ADMIN"), deleteDivision);

export default divisionRouter;
