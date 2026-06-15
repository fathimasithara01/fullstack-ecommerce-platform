import { Router } from 'express';
import * as pc from '../controllers/product.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { handleMultipleUploads } from '../middleware/upload.middleware';

const router = Router();

router.get('/', pc.getProducts);
router.get('/featured', pc.getFeaturedProducts);
router.get('/slug/:slug', pc.getProductBySlug);

router.post('/', protect, adminOnly, handleMultipleUploads('images'), pc.createProduct);
router.put('/:id', protect, adminOnly, pc.updateProduct);
router.delete('/:id', protect, adminOnly, pc.deleteProduct);
router.post('/bulk-stock', protect, adminOnly, pc.bulkUpdateStock);

export default router;