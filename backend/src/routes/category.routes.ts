import { Router } from 'express';
import * as cc from '../controllers/category.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

router.get('/', cc.getAllCategories);
router.get('/:slug', cc.getCategoryBySlug);

router.post('/', protect, adminOnly, cc.createCategory);
router.put('/:id', protect, adminOnly, cc.updateCategory);
router.delete('/:id', protect, adminOnly, cc.deleteCategory);

export default router;