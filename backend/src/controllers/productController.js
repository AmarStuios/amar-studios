import prisma from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { slugify } from '../utils/slug.js';

export const listProducts = asyncHandler(async (req, res) => {
  const {
    q, category, minPrice, maxPrice, size, color,
    sort = 'newest', page = 1, limit = 24, admin: isAdmin,
  } = req.query;

  const where = {};
  if (!isAdmin) where.active = true;
  if (category) where.category = { slug: category };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }
  if (size || color) {
    where.variants = {
      some: {
        ...(size && { size }),
        ...(color && { color: { equals: color, mode: 'insensitive' } }),
      },
    };
  }

  let orderBy = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };

  const take = Math.min(parseInt(limit, 10), 60);
  const skip = (parseInt(page, 10) - 1) * take;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, orderBy, take, skip,
      include: { category: true, images: true, variants: true },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    data: products,
    pagination: { total, page: parseInt(page, 10), limit: take, pages: Math.ceil(total / take) },
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      category: true,
      images: { orderBy: { isMain: 'desc' } },
      variants: true,
    },
  });
  if (!product) return res.status(404).json({ error: 'Produit introuvable.' });
  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name, description, price, promoPrice, categoryId,
    featured = false, isNew = true, variants = [],
  } = req.body;

  if (!name || !description || price == null || !categoryId) {
    return res.status(400).json({ error: 'Champs obligatoires manquants.' });
  }

  let slug = slugify(name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const product = await prisma.product.create({
    data: {
      name, slug, description,
      price: parseFloat(price),
      promoPrice: promoPrice ? parseFloat(promoPrice) : null,
      categoryId,
      featured: !!featured,
      isNew: !!isNew,
      variants: {
        create: variants.map((v) => ({
          size: v.size, color: v.color,
          colorHex: v.colorHex || null,
          stock: parseInt(v.stock, 10) || 0,
        })),
      },
    },
    include: { variants: true, images: true, category: true },
  });
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, promoPrice, categoryId, featured, isNew, variants } = req.body;

  const data = {};
  if (name) {
    data.name = name;
    data.slug = `${slugify(name)}-${id.slice(0, 6)}`;
  }
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = parseFloat(price);
  if (promoPrice !== undefined) data.promoPrice = promoPrice === null ? null : parseFloat(promoPrice);
  if (categoryId) data.categoryId = categoryId;
  if (featured !== undefined) data.featured = !!featured;
  if (isNew !== undefined) data.isNew = !!isNew;

  if (Array.isArray(variants)) {
    await prisma.productVariant.deleteMany({ where: { productId: id } });
    data.variants = {
      create: variants.map((v) => ({
        size: v.size, color: v.color,
        colorHex: v.colorHex || null,
        stock: parseInt(v.stock, 10) || 0,
      })),
    };
  }

  const updated = await prisma.product.update({
    where: { id }, data,
    include: { variants: true, images: true, category: true },
  });
  res.json(updated);
});

export const toggleProductStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  const updated = await prisma.product.update({
    where: { id }, data: { active: !!active },
  });
  res.json(updated);
});

/**
 * DELETE /api/products/:id
 * Gere automatiquement les cas :
 *  - Produit sans commandes : suppression complete (BDD + variantes + images Cloudinary)
 *  - Produit avec commandes : archivage (active=false) pour preserver l'historique
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { orderItems: { take: 1 }, images: true },
  });
  if (!product) return res.status(404).json({ error: 'Produit introuvable.' });

  const hasOrders = product.orderItems.length > 0;

  if (hasOrders) {
    // Archive plutot que suppression complete pour preserver les commandes
    await prisma.product.update({
      where: { id },
      data: { active: false },
    });
    return res.json({
      ok: true,
      archived: true,
      message: 'Produit archive (des commandes existaient). Il est masque du site mais conserve pour l\'historique.',
    });
  }

  // Suppression complete : variantes + images sont supprimees en cascade (schema Prisma)
  try {
    await prisma.product.delete({ where: { id } });
    res.json({ ok: true, deleted: true });
  } catch (err) {
    // Fallback : archivage si la suppression echoue pour une raison quelconque
    console.error('[deleteProduct] hard delete failed, archiving:', err.message);
    await prisma.product.update({
      where: { id }, data: { active: false },
    });
    res.json({
      ok: true,
      archived: true,
      message: 'Produit archive (suppression complete impossible).',
    });
  }
});
