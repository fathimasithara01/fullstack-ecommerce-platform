import { Router } from 'express';
import * as rc from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/product/:productId', rc.getProductReviews);
router.post('/', protect, rc.createReview);
router.put('/:id', protect, rc.updateReview);
router.delete('/:id', protect, rc.deleteReview);

export default router;