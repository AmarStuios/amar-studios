import path from 'path';
import fs from 'fs';
import prisma from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * POST /api/products/:id/images
 * Multipart: files[]
 */
export const uploadProductImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Aucune image envoyée.' });
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!product) return res.status(404).json({ error: 'Produit introuvable.' });

  const created = [];
  for (let i = 0; i < req.files.length; i++) {
    const f = req.files[i];
    const url = `/uploads/${f.filename}`;
    const isMain = product.images.length === 0 && i === 0;
    const img = await prisma.productImage.create({
      data: { productId: id, url, isMain },
    });
    created.push(img);
  }

  res.status(201).json(created);
});

/**
 * DELETE /api/images/:id
 */
export const deleteImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const img = await prisma.productImage.findUnique({ where: { id } });
  if (!img) return res.status(404).json({ error: 'Image introuvable.' });

  // remove file if local
  if (img.url.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), img.url);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        /* ignore */
      }
    }
  }

  await prisma.productImage.delete({ where: { id } });

  // if it was main, promote another
  if (img.isMain) {
    const next = await prisma.productImage.findFirst({
      where: { productId: img.productId },
    });
    if (next) {
      await prisma.productImage.update({ where: { id: next.id }, data: { isMain: true } });
    }
  }

  res.json({ ok: true });
});

/**
 * PATCH /api/images/:id/main
 */
export const setMainImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const img = await prisma.productImage.findUnique({ where: { id } });
  if (!img) return res.status(404).json({ error: 'Image introuvable.' });

  await prisma.$transaction([
    prisma.productImage.updateMany({
      where: { productId: img.productId },
      data: { isMain: false },
    }),
    prisma.productImage.update({ where: { id }, data: { isMain: true } }),
  ]);

  res.json({ ok: true });
});
