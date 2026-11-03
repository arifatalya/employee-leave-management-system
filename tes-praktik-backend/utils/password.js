import argon2 from "argon2";

export const hashPassword = async (password) => {
    return argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 1
    });
};

export const verifyPassword = async (hash, password) => {
    return argon2.verify(hash, password);
};
