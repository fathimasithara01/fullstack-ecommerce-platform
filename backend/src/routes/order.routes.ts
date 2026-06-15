import { Router } from 'express';
import * as oc from '../controllers/order.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.post('/', oc.placeOrder);
router.get('/history', oc.getUserOrders);
router.get('/:id', oc.getOrderById);
router.post('/:id/cancel', oc.cancelOrder);

export default router;