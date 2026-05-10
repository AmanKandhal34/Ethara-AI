import { verifyToken } from '../utils/generateToken.js';
import { sendError } from '../utils/responseHandler.js';
import { getDb } from '../config/db.js';
import { publicUserFields } from '../utils/sqlite.js';

export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return sendError(res, 401, 'Not authorized to access this route');
        }

        // Verify token
        const decoded = verifyToken(token);
        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

        if (!user) {
            return sendError(res, 401, 'User not found');
        }

        if (!user.isActive) {
            return sendError(res, 401, 'User account is disabled');
        }

        req.user = publicUserFields(user);

        next();
    } catch (error) {
        sendError(res, 401, error.message || 'Not authorized to access this route');
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return sendError(res, 403, 'User role is not authorized to access this route');
        }
        next();
    };
};

export default { protect, authorize };
