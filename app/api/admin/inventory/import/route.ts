import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { items } = body; // Array of { sku: string, stock?: number, lowStockThreshold?: number }

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid items format' }, { status: 400 });
        }

        const userId = (session.user as any).id;
        let successCount = 0;
        let errors: string[] = [];

        await prisma.$transaction(async (tx) => {
            let actualUserId = null;
            if (userId) {
                const userExists = await tx.user.findUnique({ where: { id: userId } });
                if (userExists) actualUserId = userId; 
            }

            for (const item of items) {
                const variant = await tx.productVariant.findUnique({ where: { sku: item.sku } });
                
                if (!variant) {
                    errors.push(`SKU ${item.sku} not found`);
                    continue;
                }

                const diff = (item.stock !== undefined) ? Number(item.stock) - variant.stock : 0;
                
                const updateData: any = {};
                if (item.stock !== undefined) updateData.stock = Number(item.stock);
                if (item.lowStockThreshold !== undefined) updateData.lowStockThreshold = Number(item.lowStockThreshold);

                if (Object.keys(updateData).length > 0) {
                    await tx.productVariant.update({
                        where: { sku: item.sku },
                        data: updateData
                    });

                    if (diff !== 0) {
                        await tx.stockHistory.create({
                            data: {
                                variantId: variant.id,
                                userId: actualUserId,
                                change: diff,
                                reason: 'CSV Batch Import Update',
                            }
                        });
                    }
                    successCount++;
                }
            }
        });

        return NextResponse.json({ success: true, count: successCount, errors });
    } catch (error) {
        console.error("Inventory import error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
