import path from 'path';
import fs from 'fs';
import prisma from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { cloudinary, USE_CLOUDINARY } from '../middlewares/upload.js';

/**
 * Extrait le public_id d'une URL Cloudinary pour pouvoir la supprimer.
 * Exemple : https://res.cloudinary.com/abc/image/upload/v123/amar-studios/file.jpg
 *  -> amar-studios/file
 */
function extractCloudinaryPublicId(url) {
  const m = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^./]+$/);
  return m ? m[1] : null;
}

/**
 * POST /api/products/:id/images
 */
export const uploadProductImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Aucune image envoyee.' });
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!product) return res.status(404).json({ error: 'Produit introuvable.' });

  const created = [];
  for (let i = 0; i < req.files.length; i++) {
    const f = req.files[i];
    // CloudinaryStorage : f.path = URL complete cloudinary
    // DiskStorage     : f.filename = nom local
    const url = USE_CLOUDINARY ? f.path : `/uploads/${f.filename}`;
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

  // Cloudinary
  if (img.url.includes('cloudinary.com')) {
    try {
      const publicId = extractCloudinaryPublicId(img.url);
      if (publicId && USE_CLOUDINARY) {
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (e) {
      console.warn('[deleteImage] Cloudinary destroy failed:', e.message);
    }
  } else if (img.url.startsWith('/uploads/')) {
    // Local
    const filePath = path.join(process.cwd(), img.url);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }

  await prisma.productImage.delete({ where: { id } });

  // promouvoir une autre image en principale si besoin
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
