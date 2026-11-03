import * as employeeService from "../services/employeeService.js";

const listEmployees = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const search = req.query.search?.trim() || "";
        const status = req.query.status || "";

        if (status && !["ACTIVE", "INACTIVE"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee status filter."
            });
        }

        const divisionId = req.user.role === "DIVISION_HEAD"
            ? req.user.division_id
            : null;

        const result = await employeeService.getEmployees({
            page, limit, search, status, divisionId
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getEmployee = async (req, res, next) => {
    try {
        const divisionId = req.user.role === "DIVISION_HEAD"
            ? req.user.division_id
            : null;

        const employee = await employeeService.getEmployeeById(
            req.params.id,
            divisionId
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        res.status(200).json({
            success: true,
            data: { employee }
        });
    } catch (error) {
        next(error);
    }
};

const createEmployee = async (req, res, next) => {
    try {
        const { nip, nama, email, alamat, division_id } = req.body;

        if (!nip || !nama || !email || !division_id) {
            return res.status(400).json({
                success: false,
                message: "NIP, name, email, and division are required."
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format."
            });
        }

        const employee = await employeeService.createEmployee({
            nip, nama, email, alamat, division_id
        });

        res.status(201).json({
            success: true,
            message: "Employee created successfully.",
            data: { employee }
        });
    } catch (error) {
        next(error);
    }
};

const updateEmployee = async (req, res, next) => {
    try {
        const { nama, email, alamat, division_id, status } = req.body;

        if (email !== undefined &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format."
            });
        }

        const employee = await employeeService.updateEmployee(
            req.params.id,
            { nama, email, alamat, division_id, status }
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Employee updated successfully.",
            data: { employee }
        });
    } catch (error) {
        next(error);
    }
};

const deleteEmployee = async (req, res, next) => {
    try {
        const deleted = await employeeService.deactivateEmployee(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Employee deactivated successfully."
        });
    } catch (error) {
        next(error);
    }
};

export {
    listEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee
};
