import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import * as schema from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(schema.registerSchema), authController.register);
router.post('/login', validate(schema.loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', validate(schema.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', validate(schema.resetPasswordSchema), authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);

// Grouping authenticated routes
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, validate(schema.updateProfileSchema), authController.updateProfile);
router.put('/change-password', protect, validate(schema.changePasswordSchema), authController.changePassword);

export default router;