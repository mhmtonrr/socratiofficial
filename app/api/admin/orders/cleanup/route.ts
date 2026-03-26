/**
 * POST /api/admin/orders/cleanup
 *
 * Cleanup routine for "PENDING" (Abandoned Checkout) orders.
 * Orders that are older than 24 hours and still in PENDING status are marked as CANCELLED.
 */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const authHeader = request.headers.get('authorization');

        // Security check: Either valid admin session OR valid cron secret
        const isCronSecretValid = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;
        const isAdmin = session && (session.user as any).role === 'ADMIN';

        if (!isAdmin && !isCronSecretValid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Find all orders that are still PENDING and older than 24h
        const pendingOrders = await prisma.order.findMany({
            where: {
                status: 'PENDING',
                createdAt: { lt: twentyFourHoursAgo }
            }
        });

        if (pendingOrders.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No old pending orders found.',
                count: 0
            });
        }

        // Update them to CANCELLED (cleanup)
        const result = await prisma.order.updateMany({
            where: {
                status: 'PENDING',
                createdAt: { lt: twentyFourHoursAgo }
            },
            data: {
                status: 'CANCELLED'
            }
        });

        // Also update associated payment records
        await prisma.payment.updateMany({
            where: {
                orderId: { in: pendingOrders.map(o => o.id) },
                status: 'PENDING'
            },
            data: {
                status: 'FAILED'
            }
        });

        console.log(`[Admin Cleanup] Marked ${result.count} orders as CANCELLED.`);

        return NextResponse.json({
            success: true,
            message: `Successfully cleaned up ${result.count} abandoned orders.`,
            count: result.count
        });

    } catch (error) {
        console.error('Cleanup error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
