import { Router } from 'express';
import * as cp from '../controllers/coupon.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

router.post('/validate', protect, cp.validateCoupon);
router.post('/', protect, adminOnly, cp.createCoupon);
router.get('/', protect, adminOnly, cp.getAllCoupons);

export default router;