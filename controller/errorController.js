const AppError = require("../utils/appError")

const sendErrorDev = (err, res) => {
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        err: err,
        stack: err.stack
    })
}

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        console.log("Production error: Operational", err)
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });

        // Programming or other unknown error: don't leak error details
    } else {
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};


const handleCastErrorDB = err => {
    // return if the value like incorrect id is passed in params

    console.log(err);
    const message = `Invalid ${err.path}:${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldDB = err => {
    const message = `Duplicate field value: ${err.keyValue.name}, use another value`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    // throws error if the 
    const errors = Object.values(err.errors).map(el => el.message);
    console.log("Errors messages", errors);
    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJsonWebTokenError = () => new AppError("Invalid web token,please try again", 401);

const handleTokenExpiredError = () => new AppError("Your token has expire, please login in again", 401)

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'fail';
    console.log(`NODE_ENV is: "${process.env.NODE_ENV}"`);
    console.error(err);

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);

    } else if (process.env.NODE_ENV.trim() === 'production') {
        let error = { ...err };
        error.message = err.message;


        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldDB(error);
        if (error.name === "ValidationError") error = handleValidationErrorDB(error);
        if (error.name === "JsonWebTokenError") error = handleJsonWebTokenError();
        if (error.name === "TokenExpiredError") error = handleTokenExpiredError();
        sendErrorProd(error, res);
    }
} 