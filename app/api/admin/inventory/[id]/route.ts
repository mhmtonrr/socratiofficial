import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAndNotifyLowStock } from '@/lib/emails';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { stock: newStock, lowStockThreshold, reason } = body;
        
        const userId = (session.user as any).id; // We need admin ID

        const oldVariant = await prisma.productVariant.findUnique({
            where: { id }
        });

        if (!oldVariant) {
            return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
        }

        const diff = (newStock !== undefined && newStock !== null) ? Number(newStock) - oldVariant.stock : 0;
        
        const updateData: any = {};
        if (newStock !== undefined && newStock !== null) updateData.stock = Number(newStock);
        if (lowStockThreshold !== undefined && lowStockThreshold !== null) updateData.lowStockThreshold = Number(lowStockThreshold);

        if (Object.keys(updateData).length === 0) {
           return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
        }

        const updated = await prisma.$transaction(async (tx) => {
            const variant = await tx.productVariant.update({
                where: { id },
                data: updateData,
                include: {
                    product: { select: { name: true, images: { take: 1 } } }
                }
            });

            // If stock changed, securely log the stock history using admin user
            if (diff !== 0) {
                let actualUserId = null;
                if (userId) {
                     const userExists = await tx.user.findUnique({ where: { id: userId } });
                     if (userExists) actualUserId = userId; 
                }

                await tx.stockHistory.create({
                    data: {
                        variantId: id,
                        userId: actualUserId,
                        change: diff,
                        reason: reason || `Manual Update by ${(session.user as any).name || 'Admin'}`,
                    }
                });
            }
            return variant;
        });

        // Check for low stock after transaction
        if (updated.stock <= updated.lowStockThreshold) {
            await checkAndNotifyLowStock(updated.id);
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Inventory update error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
