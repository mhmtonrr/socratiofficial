
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function exportData() {
    console.log('Starting data export from local database...');

    try {
        const categories = await prisma.category.findMany();
        const products = await prisma.product.findMany({
            include: {
                images: true,
                variants: true
            }
        });
        const users = await prisma.user.findMany({
            include: {
                addresses: true
            }
        });
        const reviews = await prisma.review.findMany();

        const data = {
            categories,
            products,
            users,
            reviews
        };

        const outputPath = path.join(process.cwd(), 'scripts', 'db_dump.json');
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

        console.log(`Success! Data exported to ${outputPath}`);
        console.log(`- Categories: ${categories.length}`);
        console.log(`- Products: ${products.length}`);
        console.log(`- Users: ${users.length}`);
        console.log(`- Reviews: ${reviews.length}`);

    } catch (error) {
        console.error('Export failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

exportData();
