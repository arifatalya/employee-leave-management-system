const errorHandler = (error, req, res, next) => {
    console.error(error);

    if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            success: false,
            message: "NIP or email already exists."
        });
    }

    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: statusCode === 500
            ? "Internal server error."
            : error.message
    });
};

export default errorHandler;
