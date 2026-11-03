import pool from "../config/db.js";
import { verifyToken } from "./jwt.js";

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access token is required."
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token is required."
            });
        }

        const decoded = verifyToken(token);

        const [rows] = await pool.execute(
            `SELECT
                 u.id,
                 u.employee_id,
                 u.role,
                 e.nama AS name,
                 e.email,
                 e.division_id,
                 e.status,
                 d.name AS division_name
             FROM users u
                      INNER JOIN employees e
                                 ON u.employee_id = e.id
                      INNER JOIN divisions d
                                 ON e.division_id = d.id
             WHERE u.id = ?`,
            [decoded.sub]
        );

        const user = rows[0];

        if (!user || user.status !== "ACTIVE") {
            return res.status(401).json({
                success: false,
                message: "Invalid or inactive account."
            });
        }

        req.user = {
            id: user.id,
            employee_id: user.employee_id,
            name: user.name,
            email: user.email,
            role: user.role,
            division_id: user.division_id,
            division_name: user.division_name
        };

        next();

    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired access token."
            });
        }

        next(error);
    }
};

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource."
            });
        }

        next();
    };
};

export {
    authenticate,
    authorize,
};