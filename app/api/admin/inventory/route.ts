import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const variants = await prisma.productVariant.findMany({
            include: {
                product: {
                    select: {
                        name: true,
                        isActive: true,
                        images: {
                            where: { isMain: true },
                            take: 1
                        },
                        category: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: [
                { stock: 'asc' }, // Order purely by stock so we see what's lowest first
                { product: { name: 'asc' } }
            ]
        });

        return NextResponse.json(variants);
    } catch (error) {
        console.error("Inventory fetch error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
