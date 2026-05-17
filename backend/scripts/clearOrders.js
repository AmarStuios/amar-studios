// Script pour vider toutes les commandes (utile apres tests)
// Usage : node scripts/clearOrders.js
// ATTENTION : irreversible.

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log('Suppression de toutes les commandes...');

  const itemsCount = await prisma.orderItem.count();
  const ordersCount = await prisma.order.count();

  console.log('Avant : ' + ordersCount + ' commandes / ' + itemsCount + ' lignes');

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  const remaining = await prisma.order.count();
  console.log('Apres : ' + remaining + ' commandes');
  console.log('OK - table des commandes videe');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
