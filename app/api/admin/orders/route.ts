export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/emails';
import { buildOrderShippedEmail, buildOrderDeliveredEmail } from '@/lib/email-templates';

// Get all orders
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: {
                                    include: {
                                        images: {
                                            where: { isMain: true },
                                            take: 1
                                        },
                                        category: true
                                    }
                                }
                            }
                        }
                    }
                },
                user: true,
                payment: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Update order status
export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status },
            include: { user: true }
        });

        // Send Email Notifications
        if (status === 'SHIPPED') {
            await sendEmail({
                to: updatedOrder.guestEmail || updatedOrder.user?.email || '',
                subject: `Socrati - Your Order #${updatedOrder.orderNumber} has been shipped!`,
                html: buildOrderShippedEmail(updatedOrder.orderNumber, null, null) // Tracking info can be added later if needed
            });
        } else if (status === 'DELIVERED') {
            await sendEmail({
                to: updatedOrder.guestEmail || updatedOrder.user?.email || '',
                subject: `Socrati - Your Order #${updatedOrder.orderNumber} has been delivered!`,
                html: buildOrderDeliveredEmail(updatedOrder.orderNumber)
            });
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
