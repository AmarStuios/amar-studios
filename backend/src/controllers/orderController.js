import prisma from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uniqueOrderNumber } from '../utils/slug.js';

/**
 * POST /api/orders (public, no auth)
 * body: {
 *   customerName, phone, email?, address, city, notes?,
 *   promoCode?,
 *   items: [ { productId, variantId, quantity } ]
 * }
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { customerName, phone, email, address, city, notes, items, promoCode } = req.body;

  if (!customerName || !phone || !address || !city) {
    return res.status(400).json({ error: 'Informations client incompletes.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Panier vide.' });
  }

  const result = await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const orderItemsData = [];

    for (const it of items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: it.variantId },
        include: { product: true },
      });
      if (!variant) throw Object.assign(new Error('Variante produit introuvable.'), { statusCode: 400 });
      if (!variant.product.active) {
        throw Object.assign(new Error('Produit indisponible: ' + variant.product.name), { statusCode: 400 });
      }
      if (variant.stock < it.quantity) {
        throw Object.assign(new Error(
          'Stock insuffisant pour ' + variant.product.name + ' (' + variant.size + ' / ' + variant.color + '). Disponible: ' + variant.stock
        ), { statusCode: 400 });
      }
      const unitPrice = parseFloat(variant.product.promoPrice ?? variant.product.price);
      const itemSubtotal = +(unitPrice * it.quantity).toFixed(2);
      subtotal += itemSubtotal;

      orderItemsData.push({
        productId: variant.product.id,
        variantId: variant.id,
        productName: variant.product.name,
        size: variant.size,
        color: variant.color,
        unitPrice,
        quantity: it.quantity,
        subtotal: itemSubtotal,
      });

      await tx.productVariant.update({
        where: { id: variant.id },
        data: { stock: { decrement: it.quantity } },
      });
    }

    // ---------- Application du code promo ----------
    let promoCodeId = null;
    let promoCodeText = null;
    let discountAmount = 0;

    if (promoCode) {
      const code = promoCode.toUpperCase().trim();
      const promo = await tx.promoCode.findUnique({ where: { code } });
      if (promo && promo.active) {
        const now = new Date();
        const validDate =
          (!promo.validFrom || new Date(promo.validFrom) <= now) &&
          (!promo.validUntil || new Date(promo.validUntil) >= now);
        const underLimit = !promo.usageLimit || promo.usedCount < promo.usageLimit;
        const meetsMin = !promo.minOrderAmount || subtotal >= parseFloat(promo.minOrderAmount);

        if (validDate && underLimit && meetsMin) {
          if (promo.discountType === 'PERCENT') {
            discountAmount = (subtotal * parseFloat(promo.discountValue)) / 100;
          } else {
            discountAmount = parseFloat(promo.discountValue);
          }
          discountAmount = Math.min(discountAmount, subtotal);
          discountAmount = +discountAmount.toFixed(2);
          promoCodeId = promo.id;
          promoCodeText = promo.code;
          await tx.promoCode.update({
            where: { id: promo.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    const total = +(subtotal - discountAmount).toFixed(2);

    const order = await tx.order.create({
      data: {
        orderNumber: uniqueOrderNumber(),
        customerName, phone,
        email: email || null,
        address, city,
        notes: notes || null,
        subtotal: +subtotal.toFixed(2),
        discountAmount: discountAmount > 0 ? discountAmount : null,
        promoCodeId,
        promoCodeText,
        total,
        items: { create: orderItemsData },
      },
      include: { items: true },
    });
    return order;
  });

  res.status(201).json(result);
});

export const listOrders = asyncHandler(async (req, res) => {
  const { q, status, page = 1, limit = 30 } = req.query;
  const where = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { customerName: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
      { orderNumber: { contains: q, mode: 'insensitive' } },
    ];
  }
  const take = Math.min(parseInt(limit, 10), 100);
  const skip = (parseInt(page, 10) - 1) * take;

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where, orderBy: { createdAt: 'desc' },
      include: { items: true },
      take, skip,
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    data,
    pagination: { total, page: parseInt(page, 10), limit: take, pages: Math.ceil(total / take) },
  });
});

export const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return res.status(404).json({ error: 'Commande introuvable.' });
  res.json(order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['PENDING', 'CONFIRMED', 'PREPARED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Statut invalide.' });

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return res.status(404).json({ error: 'Commande introuvable.' });

  if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
    await prisma.$transaction(
      order.items.filter((it) => it.variantId).map((it) =>
        prisma.productVariant.update({
          where: { id: it.variantId },
          data: { stock: { increment: it.quantity } },
        }),
      ),
    );
  }

  const updated = await prisma.order.update({
    where: { id }, data: { status },
    include: { items: true },
  });
  res.json(updated);
});
