import prisma from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

const LOW_STOCK_THRESHOLD = 5;

export const dashboard = asyncHandler(async (_req, res) => {
  const [
    totalProducts,
    activeProducts,
    totalOrders,
    pendingOrders,
    outOfStockCount,
    lowStockCount,
    recentOrders,
    salesAgg,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.productVariant.count({ where: { stock: 0 } }),
    prisma.productVariant.count({ where: { stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: 'CANCELLED' } },
    }),
  ]);

  // sales by status
  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  res.json({
    totals: {
      products: totalProducts,
      activeProducts,
      orders: totalOrders,
      pendingOrders,
      outOfStock: outOfStockCount,
      lowStock: lowStockCount,
      revenue: salesAgg._sum.total ? parseFloat(salesAgg._sum.total) : 0,
    },
    ordersByStatus,
    recentOrders,
  });
});

export const lowStock = asyncHandler(async (_req, res) => {
  const variants = await prisma.productVariant.findMany({
    where: { stock: { lte: LOW_STOCK_THRESHOLD } },
    include: { product: true },
    orderBy: { stock: 'asc' },
  });
  res.json(variants);
});
