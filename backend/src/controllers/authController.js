import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return res.status(401).json({ error: 'Identifiants invalides.' });
  }

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Identifiants invalides.' });
  }

  const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  res.json({
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ admin: req.admin });
});
