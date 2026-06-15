import { Router, express } from 'express';
import * as payCtrl from '../controllers/payment.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

// Webhook handling must utilize the raw buffer stream configuration layer.
// Do not process this route using the standard bodyParser JSON middleware.
router.post('/webhook', express.raw({ type: 'application/json' }), payCtrl.stripeWebhook);

router.post('/create-intent', protect, payCtrl.createPaymentIntent);
router.post('/confirm', protect, payCtrl.confirmPayment);
router.post('/refund/:orderId', protect, adminOnly, payCtrl.createRefund);
router.get('/order/:orderId', protect, payCtrl.getPaymentByOrder);

export default router;