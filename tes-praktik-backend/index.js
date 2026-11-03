import dotenv from "dotenv";
import pool from "./config/db.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT;

const start = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("DB connected.");
        connection.release();

        app.listen(PORT, () => {
            console.log("Server started on port: " + PORT);
        });
    } catch (error) {
        console.log("DB connection failed: " + error.message);
        process.exit(1);
    }
};

start();