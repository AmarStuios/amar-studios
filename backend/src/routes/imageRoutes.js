import { Router } from 'express';
import { protectAdmin } from '../middlewares/auth.js';
import { deleteImage, setMainImage } from '../controllers/imageController.js';

const router = Router();

router.delete('/:id', protectAdmin, deleteImage);
router.patch('/:id/main', protectAdmin, setMainImage);

export default router;
