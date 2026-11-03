import pool from "../config/db.js";
import { verifyPassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

const loginUser = async (email, password) => {
    const [rows] = await pool.execute(
        `SELECT
            u.id,
            u.password_hash,
            u.role,
            e.nama AS name,
            e.email,
            e.division_id,
            e.status
         FROM users u
         INNER JOIN employees e
            ON u.employee_id = e.id
         WHERE e.email = ?`,
        [email]
    );

    const user = rows[0];

    if (!user || user.status !== "ACTIVE") {
        const error = new Error("Email atau password salah.");
        error.statusCode = 401;
        throw error;
    }

    const passwordValid = await verifyPassword(
        user.password_hash,
        password
    );

    if (!passwordValid) {
        const error = new Error("Email atau password salah.");
        error.statusCode = 401;
        throw error;
    }

    const accessToken = generateToken(user.id);

    return {
        access_token: accessToken,
        user: {
            id: user.id,
            name: user.name,
            role: user.role,
            division_id: user.division_id
        }
    };
};

export default loginUser;