class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode
    });

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Handle specific error types
    if (err.message.includes('GEMINI_API_KEY')) {
        err.statusCode = 500;
        err.message = 'Server configuration error: API key not set';
    }

    if (err.message.includes('Failed to analyze privacy policy')) {
        err.statusCode = 400;
    }

    res.status(err.statusCode).json({
        status: err.status,
        error: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = {
    AppError,
    errorHandler
}; 