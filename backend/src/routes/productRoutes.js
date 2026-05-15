import { Router } from 'express';
import { body } from 'express-validator';
import { protectAdmin } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
} from '../controllers/productController.js';
import { uploadProductImages } from '../controllers/imageController.js';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProduct);

router.post(
  '/',
  protectAdmin,
  body('name').isString().notEmpty(),
  body('description').isString().notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('categoryId').isString().notEmpty(),
  validate,
  createProduct,
);

router.put('/:id', protectAdmin, updateProduct);
router.patch('/:id/status', protectAdmin, toggleProductStatus);
router.delete('/:id', protectAdmin, deleteProduct);

router.post('/:id/images', protectAdmin, upload.array('images', 8), uploadProductImages);

export default router;
