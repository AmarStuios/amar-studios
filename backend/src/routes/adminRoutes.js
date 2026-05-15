import { Router } from 'express';
import { protectAdmin } from '../middlewares/auth.js';
import { dashboard, lowStock } from '../controllers/dashboardController.js';
import { listOrders, getOrder, updateOrderStatus } from '../controllers/orderController.js';
import { me } from '../controllers/authController.js';

const router = Router();

router.get('/me', protectAdmin, me);
router.get('/dashboard', protectAdmin, dashboard);
router.get('/low-stock', protectAdmin, lowStock);

router.get('/orders', protectAdmin, listOrders);
router.get('/orders/:id', protectAdmin, getOrder);
router.patch('/orders/:id/status', protectAdmin, updateOrderStatus);

export default router;
