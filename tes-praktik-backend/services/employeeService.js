import pool from "../config/db.js";

const getEmployees = async ({ page, limit, search, status, divisionId }) => {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (divisionId) {
        conditions.push("e.division_id = ?");
        params.push(divisionId);
    }

    if (status) {
        conditions.push("e.status = ?");
        params.push(status);
    }

    if (search) {
        conditions.push("(e.nama LIKE ? OR e.nip LIKE ? OR e.email LIKE ?)");
        const keyword = `%${search}%`;
        params.push(keyword, keyword, keyword);
    }

    const where = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const [countRows] = await pool.execute(
        `SELECT COUNT(*) AS total FROM employees e ${where}`,
        params
    );

    const [rows] = await pool.execute(
        `SELECT
            e.id, e.nip, e.nama, e.email, e.alamat,
            e.division_id, d.name AS division_name, e.status,
            e.created_at, e.updated_at
         FROM employees e
         INNER JOIN divisions d ON e.division_id = d.id
         ${where}
         ORDER BY e.id DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    );

    return {
        employees: rows,
        pagination: {
            page,
            limit,
            total: countRows[0].total,
            totalPages: Math.ceil(countRows[0].total / limit)
        }
    };
};

const getEmployeeById = async (id, divisionId = null) => {
    const conditions = ["e.id = ?"];
    const params = [id];

    if (divisionId) {
        conditions.push("e.division_id = ?");
        params.push(divisionId);
    }

    const [rows] = await pool.execute(
        `SELECT
            e.id, e.nip, e.nama, e.email, e.alamat,
            e.division_id, d.name AS division_name, e.status,
            e.created_at, e.updated_at
         FROM employees e
         INNER JOIN divisions d ON e.division_id = d.id
         WHERE ${conditions.join(" AND ")}`,
        params
    );

    return rows[0] || null;
};

const createEmployee = async ({ nip, nama, email, alamat, division_id }) => {
    const [divisions] = await pool.execute(
        "SELECT id FROM divisions WHERE id = ? AND status = 'ACTIVE'",
        [division_id]
    );

    if (!divisions.length) {
        const error = new Error("Division not found or inactive.");
        error.statusCode = 400;
        throw error;
    }

    const [result] = await pool.execute(
        `INSERT INTO employees (nip, nama, email, alamat, division_id)
         VALUES (?, ?, ?, ?, ?)`,
        [nip, nama, email, alamat || null, division_id]
    );

    return getEmployeeById(result.insertId);
};

const updateEmployee = async (id, data) => {
    const allowedFields = ["nama", "email", "alamat", "division_id", "status"];
    const updates = [];
    const params = [];

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updates.push(`${field} = ?`);
            params.push(data[field]);
        }
    }

    if (!updates.length) {
        const error = new Error("No valid fields provided for update.");
        error.statusCode = 400;
        throw error;
    }

    if (data.division_id !== undefined) {
        const [divisions] = await pool.execute(
            "SELECT id FROM divisions WHERE id = ? AND status = 'ACTIVE'",
            [data.division_id]
        );

        if (!divisions.length) {
            const error = new Error("Division not found or inactive.");
            error.statusCode = 400;
            throw error;
        }
    }

    if (data.status !== undefined && !["ACTIVE", "INACTIVE"].includes(data.status)) {
        const error = new Error("Invalid employee status.");
        error.statusCode = 400;
        throw error;
    }

    params.push(id);

    const [result] = await pool.execute(
        `UPDATE employees SET ${updates.join(", ")} WHERE id = ?`,
        params
    );

    if (!result.affectedRows) return null;

    return getEmployeeById(id);
};

const deactivateEmployee = async (id) => {
    const [result] = await pool.execute(
        "UPDATE employees SET status = 'INACTIVE' WHERE id = ?",
        [id]
    );

    return result.affectedRows > 0;
};

export {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deactivateEmployee
};
