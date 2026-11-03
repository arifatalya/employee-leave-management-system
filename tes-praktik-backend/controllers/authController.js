import loginUser from "../services/authService.js";

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email dan password wajib diisi."
            });
        }

        if (!isValidEmail(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Format email tidak valid."
            });
        }

        const result = await loginUser(
            email.trim().toLowerCase(),
            password
        );

        return res.status(200).json({
            success: true,
            message: "Login berhasil.",
            data: result
        });

    } catch (error) {
        next(error);
    }
};

export default userLogin;