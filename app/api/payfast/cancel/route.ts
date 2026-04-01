/**
 * GET /api/payfast/cancel
 * Called by Payfast when user cancels the payment.
 * Marks the order as CANCELLED and redirects to the cancel page.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');

    if (orderNumber) {
        try {
            const order = await prisma.order.findFirst({
                where: { orderNumber },
                include: { payment: true },
            });

            if (order && order.status === 'PENDING') {
                await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                    await tx.order.update({
                        where: { id: order.id },
                        data: { status: 'CANCELLED' },
                    });
                    if (order.payment) {
                        await tx.payment.update({
                            where: { orderId: order.id },
                            data: { status: 'FAILED' },
                        });
                    }
                });
            }
        } catch (error) {
            console.error('[Payfast Cancel] Error updating order:', error);
        }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socratiofficial.co.za';
    return NextResponse.redirect(
        `${appUrl}/payment/cancel${orderNumber ? `?orderNumber=${orderNumber}` : ''}`
    );
}
