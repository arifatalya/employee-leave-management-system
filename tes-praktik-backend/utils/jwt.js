import jwt from "jsonwebtoken";
import fs from "node:fs";

const privateKey = fs.readFileSync(
    process.env.JWT_PRIVATE_KEY,
    "utf8"
);

const publicKey = fs.readFileSync(
    process.env.JWT_PUBLIC_KEY,
    "utf8"
);

export const generateToken = (userId) => {
    return jwt.sign({}, privateKey, {
        algorithm: "RS256",
        subject: String(userId),
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
    });
};

export const verifyToken = (token) => {
    return jwt.verify(token, publicKey, {
        algorithms: ["RS256"],
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
    });
};
