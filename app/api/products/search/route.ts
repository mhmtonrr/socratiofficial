
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json({ products: [] });
    }

    try {
        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { material: { contains: query, mode: 'insensitive' } },
                    { details: { has: query } }, // Check if query is in the details array
                    { category: { name: { contains: query, mode: 'insensitive' } } },
                    { variants: { some: { sku: { contains: query, mode: 'insensitive' } } } }
                ]
            },
            select: {
                id: true,
                name: true,
                basePrice: true,
                images: {
                    where: { isMain: true },
                    take: 1,
                    select: { url: true }
                },
                category: {
                    select: { name: true }
                }
            },
            take: 10 // Increased limit for scrollable quick search
        });

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
