import pool from "../config/db.js";

const getDashboardSummaryService = async (user) => {
    const { role, employee_id } = user;

    let employeeScope = "";
    let employeeParams = [];
    let leaveScope = "";
    let leaveParams = [];

    if (role === "ADMIN") {
    }

    else if (role === "DIVISION_HEAD") {
        const [employees] = await pool.execute(
            `SELECT division_id FROM employees WHERE id = ?`,
            [employee_id]
        );

        if (employees.length === 0) {
            const error = new Error("Employee record not found");
            error.statusCode = 404;
            throw error;
        }

        const divisionId = employees[0].division_id;

        employeeScope = "WHERE division_id = ?";
        employeeParams = [divisionId];

        leaveScope = `JOIN employees e ON lr.employee_id = e.id
        WHERE e.division_id = ?`;
        leaveParams = [divisionId];
    }

    else if (role === "STAFF") {
        leaveScope = "WHERE lr.employee_id = ?";
        leaveParams = [employee_id];
    }

    else {
        const error = new Error("Invalid user role");
        error.statusCode = 403;
        throw error;
    }

    let employeeMetrics = {
        totalEmployees: null,
        activeEmployees: null,
        inactiveEmployees: null,
    };

    if (role !== "STAFF") {
        const [employeeResults] = await pool.execute(
            `SELECT COUNT(*) AS totalEmployees,
             COALESCE(SUM(status = 'ACTIVE'), 0) AS activeEmployees,
             COALESCE(SUM(status = 'INACTIVE'), 0) AS inactiveEmployees FROM employees ${employeeScope}`,
            employeeParams
        );

        employeeMetrics = {
            totalEmployees: Number(employeeResults[0].totalEmployees),
            activeEmployees: Number(employeeResults[0].activeEmployees),
            inactiveEmployees: Number(employeeResults[0].inactiveEmployees),
        };
    }

    const [leaveResults] = await pool.execute(
        `SELECT COALESCE(SUM(lr.status = 'PENDING'), 0) AS pendingLeaveRequests,
       COALESCE(SUM(lr.status = 'APPROVED' AND lr.approved_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND lr.approved_at < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
       ), 0) AS approvedThisMonth,
       COALESCE(SUM(lr.status = 'REJECTED' AND lr.updated_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND lr.updated_at < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
       ), 0) AS rejectedThisMonth
     FROM leave_requests lr
     ${leaveScope}`,
        leaveParams
    );

    return {
        ...employeeMetrics,
        pendingLeaveRequests: Number(leaveResults[0].pendingLeaveRequests),
        approvedThisMonth: Number(leaveResults[0].approvedThisMonth),
        rejectedThisMonth: Number(leaveResults[0].rejectedThisMonth),
    };
};

export { getDashboardSummaryService };
