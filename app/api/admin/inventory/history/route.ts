import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const variantId = url.searchParams.get('variantId');

        const history = await prisma.stockHistory.findMany({
            where: variantId ? { variantId } : {},
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                user: { select: { firstName: true, email: true } },
                variant: {
                    select: {
                        size: true,
                        color: true,
                        sku: true,
                        product: { select: { name: true, images: { take: 1 } } }
                    }
                }
            }
        });

        return NextResponse.json(history);
    } catch (error) {
        console.error("Inventory history fetch error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
