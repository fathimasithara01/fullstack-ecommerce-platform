import { Router } from 'express';
import * as ac from '../controllers/address.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.get('/', ac.getUserAddresses);
router.post('/', ac.addAddress);
router.put('/:id', ac.updateAddress);
router.delete('/:id', ac.deleteAddress);

export default router;