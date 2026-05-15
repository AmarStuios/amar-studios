import prisma from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { slugify } from '../utils/slug.js';

export const listCategories = asyncHandler(async (_req, res) => {
  const cats = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  res.json(cats);
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nom requis.' });
  const cat = await prisma.category.create({
    data: { name, slug: slugify(name) },
  });
  res.status(201).json(cat);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.category.delete({ where: { id } });
  res.json({ ok: true });
});
