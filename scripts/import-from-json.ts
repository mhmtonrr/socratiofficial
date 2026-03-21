
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function importData() {
    console.log('Starting data import to Neon database...');

    const inputPath = path.join(process.cwd(), 'scripts', 'db_dump.json');
    if (!fs.existsSync(inputPath)) {
        console.error('Backup file not found!');
        return;
    }

    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);

    try {
        // 1. Clear existing data in target (caution!)
        console.log('Clearing target database...');
        await prisma.cartItem.deleteMany();
        await prisma.cart.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.payment.deleteMany();
        await prisma.order.deleteMany();
        await prisma.review.deleteMany();
        await prisma.productImage.deleteMany();
        await prisma.productVariant.deleteMany();
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        await prisma.user.deleteMany();

        // 2. Import Categories (preserving primary keys)
        console.log('Importing Categories...');
        for (const cat of data.categories) {
            await prisma.category.create({ data: cat });
        }

        // 3. Import Products with Images and Variants
        console.log('Importing Products...');
        for (const p of data.products) {
            const { images, variants, ...productData } = p;
            await prisma.product.create({
                data: {
                    ...productData,
                    images: { create: images.map(({ id, productId, ...img }: any) => img) },
                    variants: { create: variants.map(({ id, productId, ...v }: any) => v) }
                }
            });
        }

        // 4. Import Users and Addresses
        console.log('Importing Users...');
        for (const u of data.users) {
            const { addresses, ...userData } = u;
            await prisma.user.create({
                data: {
                    ...userData,
                    addresses: { create: addresses.map(({ id, userId, ...addr }: any) => addr) }
                }
            });
        }

        console.log('Import finished successfully!');
    } catch (error) {
        console.error('Import failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

importData();
