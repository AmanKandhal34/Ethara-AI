import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', protect, AuthController.getCurrentUser);
router.put('/profile', protect, AuthController.updateProfile);
router.post('/logout', protect, AuthController.logout);

export default router;
