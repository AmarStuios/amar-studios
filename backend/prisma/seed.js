import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

const slugify = (s) =>
  s.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function main() {
  console.log('Seeding database...');

  // ---------- Admin ----------
  const email = process.env.ADMIN_EMAIL || 'amaarstudios@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'amar2026';
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: 'AMAR Admin' },
  });
  console.log('Admin OK: ' + email);

  // ---------- Categories ----------
  const categories = ['Boutique', 'Nouveautes', 'Soldes'];
  const catRecords = {};
  for (const name of categories) {
    const c = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: { name },
      create: { name, slug: slugify(name) },
    });
    catRecords[name] = c;
  }

  // ---------- Clean OLD gendered categories ----------
  const OLD_SLUGS = ['hommes', 'femmes', 'accessoires'];
  const boutique = catRecords['Boutique'];
  for (const slug of OLD_SLUGS) {
    const old = await prisma.category.findUnique({ where: { slug } });
    if (old) {
      const count = await prisma.product.count({ where: { categoryId: old.id } });
      if (count > 0) {
        await prisma.product.updateMany({
          where: { categoryId: old.id },
          data: { categoryId: boutique.id },
        });
      }
      await prisma.category.delete({ where: { id: old.id } });
    }
  }
  console.log('Categories OK: ' + categories.length);

  // Plus aucun produit de demo - vous ajoutez vos vrais produits via l'admin
  console.log('Seeding complete (no demo products).');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
