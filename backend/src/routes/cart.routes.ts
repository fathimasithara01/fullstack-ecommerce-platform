import { Router } from 'express';
import * as cc from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.get('/', cc.getCart);
router.post('/', cc.addToCart);
router.post('/sync', cc.syncCart);
router.put('/item/:itemId', cc.updateCartItem);
router.delete('/item/:itemId', cc.removeCartItem);
router.delete('/clear', cc.clearCart);

export default router;