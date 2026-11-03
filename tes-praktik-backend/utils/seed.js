import dotenv from "dotenv";
import pool from "../config/db.js";
import argon2 from "argon2";

dotenv.config();

const employees = [
    {
        nip: "199603012026101",
        nama: "Chihiro Mayuzumi",
        email: "cmayuzumi@company-name.com",
        alamat: "Jl. Dr. Cipto Mangun Kusumo No.69, Paninggilan Utara, Ciledug, Kota Tangerang, Banten",
        division: "IT",
        role: "ADMIN"
    },
    {
        nip: "199812202026021",
        nama: "Seijuro Akashi",
        email: "sakashi@company-name.com",
        alamat: "Jl. Kp. Bandan No.1, Ancol, Pademangan, Kota Jakarta Utara, DKI Jakarta",
        division: "IT",
        role: "DIVISION_HEAD"
    },
    {
        nip: "199710302026041",
        nama: "Tatsuya Himuro",
        email: "thimuro@company-name.com",
        alamat: "Jl. Kuningan Barat Raya No. 8, Kuningan Barat, Mampang Prapatan, Kota Jakarta Selatan, DKI Jakarta",
        division: "IT",
        role: "STAFF"
    },
    {
        nip: "199810092026041",
        nama: "Atsushi Murasakibara",
        email: "amurasakibara@company-name.com",
        alamat: "Jl. Harsono RM Belakang No.28, Ragunan, Pasar Minggu, Kota Jakarta Selatan, DKI Jakarta",
        division: "IT",
        role: "STAFF"
    },
    {
        nip: "199611112026011",
        nama: "Kiyoshi Miyaji",
        email: "kmiyaji@company-name.com",
        alamat: "Jl. Kemang Utara No.22, Bangka, Mampang Prapatan, Kota Jakarta Selatan, DKI Jakarta",
        division: "FIN",
        role: "DIVISION_HEAD"
    },
    {
        nip: "199811212026091",
        nama: "Kazunari Takao",
        email: "ktakao@company-name.com",
        alamat: "Jl. Tebet Raya No.14, Tebet Barat, Tebet, Kota Jakarta Selatan, DKI Jakarta",
        division: "FIN",
        role: "STAFF"
    },
    {
        nip: "199807072026091",
        nama: "Shintaro Midorima",
        email: "smidorima@company-name.com",
        alamat: "Jl. Panjang No.1, Cipulir, Kebayoran Lama, Kota Jakarta Selatan, DKI Jakarta",
        division: "FIN",
        role: "STAFF"
    },
    {
        nip: "199606032026011",
        nama: "Shoichi Imayoshi",
        email: "simayoshi@company-name.com",
        alamat: "Jl. K.H. Mas Mansyur No. 1, Karet Tengsin, Tanah Abang, Kota Jakarta Pusat, DKI Jakarta",
        division: "HC",
        role: "DIVISION_HEAD"
    },
];

const divisions = [
    {
        code: "IT",
        name: "Information Technology",
    },
    {
        code: "FIN",
        name: "Finance",
    },
    {
        code: "HC",
        name: "Human Capital",
    },
];

const seedDatabase = async () => {
    const defaultPw = process.env.SEED_PASSWORD;

    if (!process.env.SEED_PASSWORD) {
        console.error("Complete the required seed password.");
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        for (const division of divisions) {
            const [existing] = await connection.execute(
                "SELECT id FROM divisions WHERE code = ?", [division.code]
            );

            if (existing.length === 0) {
                await connection.execute(
                    `INSERT INTO divisions (code, name) VALUES (?, ?)`,
                    [division.code, division.name]
                );
            }
        }

        for (const employee of employees) {
            const [divisionRows] = await connection.execute(
                "SELECT id FROM divisions WHERE code = ?", [employee.division]
            );

            if (divisionRows.length === 0) {
                console.error(`Division ${employee.division} does not exist.`);
            }

            const divisionId = divisionRows[0].id;
            let employeeId;

            const [existingEmployees] = await connection.execute(
                "SELECT id FROM employees WHERE nip = ?", [employee.nip]
            );

            if (existingEmployees.length > 0) {
                employeeId = existingEmployees[0].id;
            } else {
                const [result] = await connection.execute(
                    `INSERT INTO employees (nip, nama, email, alamat, division_id) VALUES (?, ?, ?, ?, ?)`,
                    [
                        employee.nip,
                        employee.nama,
                        employee.email,
                        employee.alamat,
                        divisionId
                    ]
                );
                employeeId = result.insertId;
            }

            const [existingUsers] = await connection.execute(
                "SELECT id FROM users WHERE employee_id = ?", [employeeId]
            );

            if (existingUsers.length === 0) {
                const passwordHash = await argon2.hash(defaultPw,
                    {
                        type: argon2.argon2id,
                        memoryCost: 65536,
                        timeCost: 3,
                        parallelism: 1
                    }
                );
                await connection.execute(
                    `INSERT INTO users (employee_id, password_hash, role) VALUES (?, ?, ?)`,
                    [employeeId, passwordHash, employee.role]
                );
            }
        }
        await connection.commit();

        console.log("Test accounts seeded successfully.");
    } catch (error) {
        await connection.rollback();
        console.error("Seeding failed:", error.message);
        throw error;

    } finally {
        connection.release();
        await pool.end();
    }
};

seedDatabase().catch(() => {
    process.exit(1);
});