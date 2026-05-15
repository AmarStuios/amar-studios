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
  const email = process.env.ADMIN_EMAIL || 'admin@amarstudios.com';
  const password = process.env.ADMIN_PASSWORD || 'amar2026';
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: 'AMAR Admin' },
  });
  console.log('Admin OK: ' + email + ' / ' + password);

  // ---------- New categories ----------
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
        console.log('Reassigned ' + count + ' products from "' + slug + '" to "boutique"');
      }
      await prisma.category.delete({ where: { id: old.id } });
      console.log('Deleted old category: ' + slug);
    }
  }
  console.log('Categories OK: ' + categories.length);

  // ---------- Sample products (MAD prices) ----------
  const sampleProducts = [
    {
      name: 'T-Shirt Oversize Noir',
      description: 'T-shirt oversize en coton premium 100%. Coupe ample, col rond, finitions soignees.',
      price: 499, promoPrice: 399, category: 'Boutique', featured: true,
      variants: [
        { size: 'S', color: 'Noir', colorHex: '#000000', stock: 12 },
        { size: 'M', color: 'Noir', colorHex: '#000000', stock: 20 },
        { size: 'L', color: 'Noir', colorHex: '#000000', stock: 15 },
        { size: 'XL', color: 'Noir', colorHex: '#000000', stock: 8 },
        { size: 'M', color: 'Blanc', colorHex: '#FFFFFF', stock: 18 },
      ],
    },
    {
      name: 'Hoodie Essentiel Gris',
      description: 'Sweat a capuche en molleton gratte. Coupe relax, poche kangourou. Confort absolu.',
      price: 899, category: 'Boutique', featured: true,
      variants: [
        { size: 'M', color: 'Gris', colorHex: '#808080', stock: 10 },
        { size: 'L', color: 'Gris', colorHex: '#808080', stock: 12 },
        { size: 'XL', color: 'Gris', colorHex: '#808080', stock: 6 },
      ],
    },
    {
      name: 'Pantalon Cargo Noir',
      description: 'Pantalon cargo en coton epais. Coupe droite, multi-poches.',
      price: 1199, promoPrice: 899, category: 'Boutique', featured: true,
      variants: [
        { size: 'S', color: 'Noir', colorHex: '#000000', stock: 5 },
        { size: 'M', color: 'Noir', colorHex: '#000000', stock: 8 },
        { size: 'L', color: 'Noir', colorHex: '#000000', stock: 6 },
      ],
    },
    {
      name: 'Veste Bomber Minimaliste',
      description: 'Veste bomber en tissu technique. Fermeture YKK, poches laterales.',
      price: 1999, category: 'Boutique', featured: true,
      variants: [
        { size: 'M', color: 'Noir', colorHex: '#000000', stock: 7 },
        { size: 'L', color: 'Noir', colorHex: '#000000', stock: 5 },
      ],
    },
  ];

  for (const p of sampleProducts) {
    const slug = slugify(p.name);
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        promoPrice: p.promoPrice ?? null,
        featured: p.featured ?? false,
        isNew: true,
        categoryId: catRecords[p.category].id,
        variants: { create: p.variants },
      },
    });
  }
  console.log('Products OK: ' + sampleProducts.length);
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
