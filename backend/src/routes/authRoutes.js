import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middlewares/validate.js';
import { adminLogin } from '../controllers/authController.js';

const router = Router();

router.post(
  '/',
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 4 }).withMessage('Mot de passe requis'),
  validate,
  adminLogin,
);

export default router;
