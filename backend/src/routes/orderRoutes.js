import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middlewares/validate.js';
import { createOrder } from '../controllers/orderController.js';

const router = Router();

// Public — no client account
router.post(
  '/',
  body('customerName').isString().notEmpty().withMessage('Nom complet requis'),
  body('phone').isString().notEmpty().withMessage('Téléphone requis'),
  body('address').isString().notEmpty().withMessage('Adresse requise'),
  body('city').isString().notEmpty().withMessage('Ville requise'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Email invalide'),
  body('items').isArray({ min: 1 }).withMessage('Panier vide'),
  validate,
  createOrder,
);

export default router;
