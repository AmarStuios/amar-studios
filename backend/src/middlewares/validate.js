import { validationResult } from 'express-validator';

export default function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}
