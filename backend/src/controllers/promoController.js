import prisma from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/admin/promo-codes
 */
export const listPromoCodes = asyncHandler(async (_req, res) => {
  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(codes);
});

/**
 * POST /api/admin/promo-codes
 */
export const createPromoCode = asyncHandler(async (req, res) => {
  const {
    code, description, discountType, discountValue, active = true,
    usageLimit, minOrderAmount, validFrom, validUntil,
  } = req.body;

  if (!code || !discountValue) {
    return res.status(400).json({ error: 'Code et valeur requis.' });
  }
  if (!['PERCENT', 'FIXED'].includes(discountType)) {
    return res.status(400).json({ error: 'Type de remise invalide.' });
  }

  const promo = await prisma.promoCode.create({
    data: {
      code: code.toUpperCase().trim(),
      description: description || null,
      discountType,
      discountValue: parseFloat(discountValue),
      active: !!active,
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
      minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
      validFrom: validFrom ? new Date(validFrom) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
    },
  });
  res.status(201).json(promo);
});

/**
 * PUT /api/admin/promo-codes/:id
 */
export const updatePromoCode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    code, description, discountType, discountValue, active,
    usageLimit, minOrderAmount, validFrom, validUntil,
  } = req.body;

  const data = {};
  if (code !== undefined) data.code = code.toUpperCase().trim();
  if (description !== undefined) data.description = description || null;
  if (discountType !== undefined) data.discountType = discountType;
  if (discountValue !== undefined) data.discountValue = parseFloat(discountValue);
  if (active !== undefined) data.active = !!active;
  if (usageLimit !== undefined) data.usageLimit = usageLimit ? parseInt(usageLimit, 10) : null;
  if (minOrderAmount !== undefined) data.minOrderAmount = minOrderAmount ? parseFloat(minOrderAmount) : null;
  if (validFrom !== undefined) data.validFrom = validFrom ? new Date(validFrom) : null;
  if (validUntil !== undefined) data.validUntil = validUntil ? new Date(validUntil) : null;

  const promo = await prisma.promoCode.update({ where: { id }, data });
  res.json(promo);
});

/**
 * DELETE /api/admin/promo-codes/:id
 */
export const deletePromoCode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.promoCode.delete({ where: { id } });
  res.json({ ok: true });
});

/**
 * POST /api/promo/validate
 * body: { code, subtotal }
 * Verifie qu'un code promo est valide et retourne la remise applicable
 */
export const validatePromoCode = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: 'Code requis.' });

  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase().trim() },
  });

  if (!promo) return res.status(404).json({ error: 'Code promo invalide.' });
  if (!promo.active) return res.status(400).json({ error: 'Ce code n\'est plus actif.' });

  const now = new Date();
  if (promo.validFrom && new Date(promo.validFrom) > now) {
    return res.status(400).json({ error: 'Ce code n\'est pas encore valide.' });
  }
  if (promo.validUntil && new Date(promo.validUntil) < now) {
    return res.status(400).json({ error: 'Ce code a expire.' });
  }
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    return res.status(400).json({ error: 'Ce code a atteint sa limite d\'utilisation.' });
  }
  if (promo.minOrderAmount && subtotal && parseFloat(subtotal) < parseFloat(promo.minOrderAmount)) {
    return res.status(400).json({
      error: 'Commande minimum requise : ' + parseFloat(promo.minOrderAmount).toFixed(0) + ' MAD.',
    });
  }

  let discountAmount = 0;
  if (promo.discountType === 'PERCENT') {
    discountAmount = (parseFloat(subtotal || 0) * parseFloat(promo.discountValue)) / 100;
  } else {
    discountAmount = parseFloat(promo.discountValue);
  }
  discountAmount = Math.min(discountAmount, parseFloat(subtotal || 0));

  res.json({
    valid: true,
    code: promo.code,
    promoCodeId: promo.id,
    discountType: promo.discountType,
    discountValue: parseFloat(promo.discountValue),
    discountAmount: +discountAmount.toFixed(2),
    description: promo.description,
  });
});
