import pool from "../config/db.js";

const getDivisions = async () => {
    const [rows] = await pool.execute(
        `SELECT
            d.id,
            d.code,
            d.name,
            d.status,
            d.created_at,
            d.updated_at,
            COUNT(e.id) AS employee_count
         FROM divisions d
         LEFT JOIN employees e ON e.division_id = d.id
         GROUP BY d.id
         ORDER BY d.id ASC`
    );

    return rows;
};

const getDivisionById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT
            d.id,
            d.code,
            d.name,
            d.status,
            d.created_at,
            d.updated_at,
            COUNT(e.id) AS employee_count
         FROM divisions d
         LEFT JOIN employees e ON e.division_id = d.id
         WHERE d.id = ?
         GROUP BY d.id`,
        [id]
    );

    return rows[0] || null;
};

const createDivision = async ({ code, name }) => {
    const [result] = await pool.execute(
        `INSERT INTO divisions (code, name)
         VALUES (?, ?)`,
        [code, name]
    );

    return getDivisionById(result.insertId);
};

const updateDivision = async (id, data) => {
    const fields = ["code", "name", "status"];
    const updates = [];
    const params = [];

    for (const field of fields) {
        if (data[field] !== undefined) {
            updates.push(`${field} = ?`);
            params.push(data[field]);
        }
    }

    if (!updates.length) {
        const error = new Error("No valid fields provided.");
        error.statusCode = 400;
        throw error;
    }

    params.push(id);

    const [result] = await pool.execute(
        `UPDATE divisions
         SET ${updates.join(", ")}
         WHERE id = ?`,
        params
    );

    if (!result.affectedRows) return null;

    return getDivisionById(id);
};

const deactivateDivision = async (id) => {
    const [result] = await pool.execute(
        `UPDATE divisions
         SET status = 'INACTIVE'
         WHERE id = ?`,
        [id]
    );

    return result.affectedRows > 0;
};

export {
    getDivisions,
    getDivisionById,
    createDivision,
    updateDivision,
    deactivateDivision
};
