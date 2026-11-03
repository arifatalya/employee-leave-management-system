import * as divisionService from "../services/divisionService.js";

const listDivisions = async (req, res, next) => {
    try {
        const divisions = await divisionService.getDivisions();

        res.status(200).json({
            success: true,
            data: { divisions }
        });
    } catch (error) {
        next(error);
    }
};

const getDivision = async (req, res, next) => {
    try {
        const division = await divisionService.getDivisionById(req.params.id);

        if (!division) {
            return res.status(404).json({
                success: false,
                message: "Division not found."
            });
        }

        res.status(200).json({
            success: true,
            data: { division }
        });
    } catch (error) {
        next(error);
    }
};

const createDivision = async (req, res, next) => {
    try {
        const { code, name } = req.body;

        if (!code || !name || typeof code !== "string" ||
            typeof name !== "string" || !code.trim() || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Division code and name are required."
            });
        }

        const division = await divisionService.createDivision({
            code: code.trim(),
            name: name.trim()
        });

        res.status(201).json({
            success: true,
            message: "Division created successfully.",
            data: { division }
        });
    } catch (error) {
        next(error);
    }
};

const updateDivision = async (req, res, next) => {
    try {
        const allowedFields = ["code", "name", "status"];

        const invalidFields = Object.keys(req.body).filter(
            field => !allowedFields.includes(field)
        );

        if (invalidFields.length) {
            return res.status(400).json({
                success: false,
                message: `Invalid fields: ${invalidFields.join(", ")}`
            });
        }

        const { code, name, status } = req.body;

        if (
            (code !== undefined &&
                (typeof code !== "string" || !code.trim())) ||
            (name !== undefined &&
                (typeof name !== "string" || !name.trim()))
        ) {
            return res.status(400).json({
                success: false,
                message: "Division code and name cannot be empty."
            });
        }

        if (status !== undefined &&
            !["ACTIVE", "INACTIVE"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid division status."
            });
        }

        const division = await divisionService.updateDivision(
            req.params.id,
            {
                ...(code !== undefined && { code: code.trim() }),
                ...(name !== undefined && { name: name.trim() }),
                status
            }
        );

        if (!division) {
            return res.status(404).json({
                success: false,
                message: "Division not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Division updated successfully.",
            data: { division }
        });
    } catch (error) {
        next(error);
    }
};

const deleteDivision = async (req, res, next) => {
    try {
        const deleted = await divisionService.deactivateDivision(
            req.params.id
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Division not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Division deactivated successfully."
        });
    } catch (error) {
        next(error);
    }
};

export {
    listDivisions,
    getDivision,
    createDivision,
    updateDivision,
    deleteDivision
};
