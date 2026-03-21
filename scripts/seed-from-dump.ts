/**
 * Seed script that imports data from scripts/db_dump.json into the database.
 * Run with: npx ts-node --compiler-options {"module":"CommonJS"} scripts/seed-from-dump.ts
 *
 * Insertion order respects FK constraints:
 *   Categories (parents first) → Products → ProductImages → ProductVariants → Users
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface DumpCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DumpProductImage {
  id: string;
  url: string;
  altText: string | null;
  isMain: boolean;
  color: string | null;
  productId: string;
}

interface DumpProductVariant {
  id: string;
  sku: string;
  productId: string;
  size: string | null;
  color: string;
  colorHex: string | null;
  price: string | null;
  stock: number;
}

interface DumpProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: string;
  isActive: boolean;
  material: string | null;
  care: string | null;
  details: string[];
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  images: DumpProductImage[];
  variants: DumpProductVariant[];
}

interface DumpUser {
  id: string;
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DbDump {
  categories: DumpCategory[];
  products: DumpProduct[];
  users: DumpUser[];
  reviews: unknown[];
}

async function main() {
  const dumpPath = path.join(__dirname, "db_dump.json");
  const raw = fs.readFileSync(dumpPath, "utf-8");
  const dump: DbDump = JSON.parse(raw);

  console.log("🌱 Starting seed from db_dump.json...\n");

  // ─── Categories (insert parents before children) ──────────────────────────
  console.log(`📂 Seeding ${dump.categories.length} categories...`);

  // Sort: parents (no parentId) first, then children
  const sortedCategories = [...dump.categories].sort((a, b) => {
    if (a.parentId === null && b.parentId !== null) return -1;
    if (a.parentId !== null && b.parentId === null) return 1;
    return 0;
  });

  for (const cat of sortedCategories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        parentId: cat.parentId,
        createdAt: new Date(cat.createdAt),
        updatedAt: new Date(cat.updatedAt),
      },
    });
  }
  console.log(`   ✅ Categories done.\n`);

  // ─── Products ──────────────────────────────────────────────────────────────
  console.log(`👟 Seeding ${dump.products.length} products...`);

  for (const prod of dump.products) {
    // Upsert the product itself
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {},
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        basePrice: prod.basePrice,
        isActive: prod.isActive,
        material: prod.material,
        care: prod.care,
        details: prod.details,
        categoryId: prod.categoryId,
        createdAt: new Date(prod.createdAt),
        updatedAt: new Date(prod.updatedAt),
      },
    });

    // Upsert images
    for (const img of prod.images) {
      await prisma.productImage.upsert({
        where: { id: img.id },
        update: {},
        create: {
          id: img.id,
          url: img.url,
          altText: img.altText,
          isMain: img.isMain,
          color: img.color,
          productId: img.productId,
        },
      });
    }

    // Upsert variants
    for (const variant of prod.variants) {
      await prisma.productVariant.upsert({
        where: { id: variant.id },
        update: {},
        create: {
          id: variant.id,
          sku: variant.sku,
          productId: variant.productId,
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex,
          price: variant.price,
          stock: variant.stock,
        },
      });
    }

    console.log(`   ✅ Product "${prod.name}" seeded.`);
  }
  console.log();

  // ─── Users ────────────────────────────────────────────────────────────────
  console.log(`👤 Seeding ${dump.users.length} users...`);

  for (const user of dump.users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        password: user.password, // Already bcrypt-hashed in dump
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as "USER" | "ADMIN",
        phone: user.phone,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
    });
    console.log(`   ✅ User "${user.email}" seeded.`);
  }

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
