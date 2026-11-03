import pool from "../config/db.js";

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const calculateTotalDays = (startDate, endDate) => {
    let total = 0;

    const current = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);

    while (current <= end) {
        const day = current.getUTCDay();
        if (day !== 0 && day !== 6) {
            total++;
        }
        current.setUTCDate(current.getUTCDate() + 1);
    }

    return total;
};

const isValidDate = (value) => {
    if (typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00Z`);

    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const getLeaveRequests = async (user) => {
    let conditions = [];
    let params = [];

    if (user.role === "STAFF") {
        conditions.push("lr.employee_id = ?");
        params.push(user.employee_id);
    } else if (user.role === "DIVISION_HEAD") {
        conditions.push("e.division_id = ?");
        params.push(user.division_id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await pool.execute(
        `SELECT
            lr.id,
            lr.employee_id,
            e.nip,
            e.nama AS employee_name,
            e.division_id,
            d.name AS division_name,
            lr.start_date,
            lr.end_date,
            lr.reason,
            lr.total_days,
            lr.status,
            lr.approved_by,
            approver.nama AS approved_by_name,
            lr.approved_at,
            lr.created_at,
            lr.updated_at
         FROM leave_requests lr
         INNER JOIN employees e ON lr.employee_id = e.id
         INNER JOIN divisions d ON e.division_id = d.id
         LEFT JOIN users u ON lr.approved_by = u.id
         LEFT JOIN employees approver ON u.employee_id = approver.id
         ${where}
         ORDER BY lr.created_at DESC`,
        params
    );

    return rows;
};

const getPendingRequests = async (divisionId) => {
    const [rows] = await pool.execute(
        `SELECT
            lr.id,
            lr.employee_id,
            e.nip,
            e.nama AS employee_name,
            e.division_id,
            d.name AS division_name,
            lr.start_date,
            lr.end_date,
            lr.reason,
            lr.total_days,
            lr.status,
            lr.created_at
         FROM leave_requests lr
         INNER JOIN employees e ON lr.employee_id = e.id
         INNER JOIN divisions d ON e.division_id = d.id
         WHERE lr.status = 'PENDING'
           AND e.division_id = ?
           AND EXISTS (
               SELECT 1
               FROM users u
               WHERE u.employee_id = lr.employee_id
                 AND u.role = 'STAFF'
           )
         ORDER BY lr.created_at ASC`,
        [divisionId]
    );

    return rows;
};

const getLeaveRequestById = async (id, user) => {
    const conditions = ["lr.id = ?"];
    const params = [id];

    if (user.role === "STAFF") {
        conditions.push("lr.employee_id = ?");
        params.push(user.employee_id);
    } else if (user.role === "DIVISION_HEAD") {
        conditions.push("e.division_id = ?");
        params.push(user.division_id);
    }

    const [rows] = await pool.execute(
        `SELECT
            lr.id,
            lr.employee_id,
            e.nama AS employee_name,
            e.division_id,
            d.name AS division_name,
            lr.start_date,
            lr.end_date,
            lr.reason,
            lr.total_days,
            lr.status,
            lr.approved_by,
            approver.nama AS approved_by_name,
            lr.approved_at,
            lr.created_at,
            lr.updated_at
         FROM leave_requests lr
         INNER JOIN employees e ON lr.employee_id = e.id
         INNER JOIN divisions d ON e.division_id = d.id
         LEFT JOIN users u ON lr.approved_by = u.id
         LEFT JOIN employees approver ON u.employee_id = approver.id
         WHERE ${conditions.join(" AND ")}`,
        params
    );

    return rows[0] || null;
};

const createLeaveRequest = async (user, { start_date, end_date, reason }) => {
    if (!isValidDate(start_date) || !isValidDate(end_date)) {
        throw createHttpError("Dates must use YYYY-MM-DD format.", 400);
    }

    if (end_date < start_date) {
        throw createHttpError(
            "End date cannot be earlier than start date.",
            400
        );
    }

    if (typeof reason !== "string" || !reason.trim()) {
        throw createHttpError("Leave reason is required.", 400);
    }

    const totalDays = calculateTotalDays(start_date, end_date);

    if (totalDays === 0) {
        throw createHttpError(
            "Leave request must contain at least one working day.",
            400
        );
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [employees] = await connection.execute(
            `SELECT id, status
             FROM employees
             WHERE id = ?
             FOR UPDATE`,
            [user.employee_id]
        );

        if (!employees.length || employees[0].status !== "ACTIVE") {
            throw createHttpError(
                "Only active employees can request leave.",
                403
            );
        }

        const [overlaps] = await connection.execute(
            `SELECT id
             FROM leave_requests
             WHERE employee_id = ?
               AND status = 'APPROVED'
               AND start_date <= ?
               AND end_date >= ?
             FOR UPDATE`,
            [user.employee_id, end_date, start_date]
        );

        if (overlaps.length) {
            throw createHttpError(
                "Leave dates overlap with an existing approved request.",
                409
            );
        }

        const [result] = await connection.execute(
            `INSERT INTO leave_requests
                (employee_id, start_date, end_date, reason, total_days)
             VALUES (?, ?, ?, ?, ?)`,
            [
                user.employee_id,
                start_date,
                end_date,
                reason.trim(),
                totalDays
            ]
        );

        await connection.commit();

        return result.insertId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const processLeaveRequest = async (id, user, decision) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [requests] = await connection.execute(
            `SELECT
                lr.id,
                lr.employee_id,
                lr.start_date,
                lr.end_date,
                lr.status,
                e.division_id,
                u.role AS employee_role
             FROM leave_requests lr
             INNER JOIN employees e ON lr.employee_id = e.id
             LEFT JOIN users u ON u.employee_id = e.id
             WHERE lr.id = ?
             FOR UPDATE`,
            [id]
        );

        const request = requests[0];

        if (!request || request.division_id !== user.division_id) {
            throw createHttpError("Leave request not found.", 404);
        }

        if (request.employee_role !== "STAFF") {
            throw createHttpError(
                "Only STAFF leave requests can be processed.",
                403
            );
        }

        if (request.status !== "PENDING") {
            throw createHttpError(
                "Only pending requests can be processed.",
                409
            );
        }

        if (decision === "APPROVED") {
            const [overlaps] = await connection.execute(
                `SELECT id
                 FROM leave_requests
                 WHERE employee_id = ?
                   AND id <> ?
                   AND status = 'APPROVED'
                   AND start_date <= ?
                   AND end_date >= ?
                 FOR UPDATE`,
                [
                    request.employee_id,
                    id,
                    request.end_date,
                    request.start_date
                ]
            );

            if (overlaps.length) {
                throw createHttpError(
                    "Leave dates overlap with another approved request.",
                    409
                );
            }
        }

        await connection.execute(
            `UPDATE leave_requests
             SET status = ?,
                 approved_by = ?,
                 approved_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [decision, user.id, id]
        );

        await connection.commit();

        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export {
    getLeaveRequests,
    getPendingRequests,
    getLeaveRequestById,
    createLeaveRequest,
    processLeaveRequest
};
