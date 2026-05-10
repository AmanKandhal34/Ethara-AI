import AuthService from '../services/auth.service.js';
import { sendResponse, sendError } from '../utils/responseHandler.js';

export class AuthController {
    static async register(req, res, next) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return sendError(res, 400, 'Please provide name, email, and password');
            }

            const result = await AuthService.register({ name, email, password });
            sendResponse(res, 201, true, 'User registered successfully', result);
        } catch (error) {
            sendError(res, 400, error.message);
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const result = await AuthService.login(email, password);
            sendResponse(res, 200, true, 'Login successful', result);
        } catch (error) {
            sendError(res, 401, error.message);
        }
    }

    static async getCurrentUser(req, res, next) {
        try {
            const user = await AuthService.getCurrentUser(req.user._id);
            sendResponse(res, 200, true, 'User retrieved successfully', user);
        } catch (error) {
            sendError(res, 400, error.message);
        }
    }

    static async updateProfile(req, res, next) {
        try {
            const { name, avatar, bio } = req.body;

            const user = await AuthService.updateProfile(req.user._id, {
                name,
                avatar,
                bio,
            });

            sendResponse(res, 200, true, 'Profile updated successfully', user);
        } catch (error) {
            sendError(res, 400, error.message);
        }
    }

    static async logout(req, res, next) {
        try {
            const result = await AuthService.logout(req.user._id);
            sendResponse(res, 200, true, 'Logged out successfully', result);
        } catch (error) {
            sendError(res, 400, error.message);
        }
    }
}

export default AuthController;
