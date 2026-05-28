import { Router } from 'express';
import { protectAdmin } from '../middlewares/auth.js';
import {
  listPromoCodes, createPromoCode, updatePromoCode, deletePromoCode, validatePromoCode,
} from '../controllers/promoController.js';

const router = Router();

// Public
router.post('/validate', validatePromoCode);

// Admin
router.get('/admin', protectAdmin, listPromoCodes);
router.post('/admin', protectAdmin, createPromoCode);
router.put('/admin/:id', protectAdmin, updatePromoCode);
router.delete('/admin/:id', protectAdmin, deletePromoCode);

export default router;
