import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const fromDateParam = searchParams.get('from');
        const toDateParam = searchParams.get('to');

        // Default to last 30 days if no date is provided
        const toDate = toDateParam ? endOfDay(parseISO(toDateParam)) : endOfDay(new Date());
        const fromDate = fromDateParam ? startOfDay(parseISO(fromDateParam)) : startOfDay(subDays(new Date(), 30));

        // Fetch valid successful orders
        const validStatuses = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: fromDate,
                    lte: toDate,
                },
                status: {
                    in: validStatuses as any, // valid enum values
                },
            },
            include: {
                user: true,
                items: {
                    include: {
                        variant: {
                            include: {
                                product: {
                                    include: {
                                        category: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Compute Aggregations in Memory
        let totalRevenue = 0;
        let totalOrders = orders.length;

        const revenueByDateMap: Record<string, number> = {};
        const ordersByDateMap: Record<string, number> = {};
        const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
        const categorySalesMap: Record<string, number> = {};
        const customerSpendMap: Record<string, { email: string; name: string; spend: number; ordersCount: number }> = {};

        // In case there are days with 0 orders, we could prefill revenueByDateMap here, but Recharts handles it mostly fine.
        
        for (const order of orders) {
            const orderTotal = Number(order.totalAmount);
            totalRevenue += orderTotal;

            const dateStr = format(order.createdAt, 'MMM dd');
            
            // Revenue & Orders over time
            revenueByDateMap[dateStr] = (revenueByDateMap[dateStr] || 0) + orderTotal;
            ordersByDateMap[dateStr] = (ordersByDateMap[dateStr] || 0) + 1;

            // Customer details
            const customerEmail = order.user?.email || order.guestEmail || 'Guest';
            const customerName = order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Guest Customer';
            const customerKey = `${customerEmail}-${customerName}`;

            if (!customerSpendMap[customerKey]) {
                customerSpendMap[customerKey] = { email: customerEmail, name: customerName, spend: 0, ordersCount: 0 };
            }
            customerSpendMap[customerKey].spend += orderTotal;
            customerSpendMap[customerKey].ordersCount += 1;

            // Process Items
            for (const item of order.items) {
                const itemTotal = Number(item.totalPrice);
                const quantity = item.quantity;
                const prodName = item.productName;

                // Product Map
                if (!productSalesMap[prodName]) {
                    productSalesMap[prodName] = { name: prodName, quantity: 0, revenue: 0 };
                }
                productSalesMap[prodName].quantity += quantity;
                productSalesMap[prodName].revenue += itemTotal;

                // Category Map
                const categoryName = item.variant?.product?.category?.name || 'Uncategorized';
                categorySalesMap[categoryName] = (categorySalesMap[categoryName] || 0) + itemTotal;
            }
        }

        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Convert Maps to Arrays for charts
        const revenueOverTime = Object.keys(revenueByDateMap).map(date => ({
            date,
            revenue: revenueByDateMap[date],
            orders: ordersByDateMap[date],
        }));

        const topSellingProducts = Object.values(productSalesMap)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10); // top 10

        const bestCustomers = Object.values(customerSpendMap)
            .sort((a, b) => b.spend - a.spend)
            .slice(0, 10);

        const salesByCategory = Object.keys(categorySalesMap).map(category => ({
            name: category,
            value: categorySalesMap[category],
        })).sort((a, b) => b.value - a.value);

        return NextResponse.json({
            totals: {
                totalRevenue,
                totalOrders,
                averageOrderValue,
            },
            revenueOverTime,
            topSellingProducts,
            bestCustomers,
            salesByCategory,
        });

    } catch (error) {
        console.error('Reports endpoint error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
