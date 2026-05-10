import { sendError } from '../utils/responseHandler.js';

export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // SQLite constraint errors
    if (typeof err.code === 'string' && err.code.startsWith('SQLITE_CONSTRAINT')) {
        err.statusCode = 409;
        err.message = 'A record with those details already exists';
    }

    // Validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
        err.statusCode = 400;
        err.message = message;
    }

    // Unique constraint / duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        err.statusCode = 409;
        err.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }

    // JWT error
    if (err.name === 'JsonWebTokenError') {
        err.statusCode = 401;
        err.message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        err.statusCode = 401;
        err.message = 'Token expired';
    }

    // Cast error
    if (err.name === 'CastError') {
        err.statusCode = 400;
        err.message = `Invalid ${err.path}`;
    }

    sendError(res, err.statusCode, err.message);
};

export default errorHandler;
