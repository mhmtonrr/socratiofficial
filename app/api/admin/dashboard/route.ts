
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Total Revenue (Only from non-cancelled orders)
        const orders = await prisma.order.findMany({
            where: {
                status: { not: 'CANCELLED' }
            }
        });
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

        // 2. Total Orders count
        const totalOrders = orders.length;

        // 3. Pending Orders count
        const pendingOrders = await prisma.order.count({
            where: { status: 'PENDING' }
        });

        // 4. Total Products & Variants count
        const totalProducts = await prisma.product.count();

        // 5. Recent Orders (Last 5)
        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                items: true
            }
        });

        // 6. Low stock variants (less than 10)
        const lowStockVariants = await prisma.productVariant.findMany({
            where: {
                stock: { lt: 10 }
            },
            include: {
                product: true
            },
            take: 5
        });

        // 7. Calculate growth (Mock baseline for now since we don't have historical data aggregated)
        // In a real app, you compare this month vs last month
        const growth = 12.5; // Mock 12.5% growth

        return NextResponse.json({
            stats: {
                totalRevenue,
                totalOrders,
                pendingOrders,
                totalProducts,
                growth
            },
            recentOrders,
            lowStock: lowStockVariants
        });

    } catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
