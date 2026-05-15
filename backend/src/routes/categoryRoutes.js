import { Router } from 'express';
import { protectAdmin } from '../middlewares/auth.js';
import {
  listCategories,
  createCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

const router = Router();

router.get('/', listCategories);
router.post('/', protectAdmin, createCategory);
router.delete('/:id', protectAdmin, deleteCategory);

export default router;
