export const sendResponse = (res, statusCode, success, message, data = null) => {
    res.status(statusCode).json({
        success,
        message,
        data,
    });
};

export const sendError = (res, statusCode, message, errors = null) => {
    res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};

export const sendPaginatedResponse = (res, statusCode, data, page, limit, total) => {
    res.status(statusCode).json({
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    });
};

export default { sendResponse, sendError, sendPaginatedResponse };
