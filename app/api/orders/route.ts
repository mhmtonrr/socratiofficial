export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface OrderItemData {
    variantId: string;
    productName: string;
    sku: string;
    size: string | null;
    color: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await request.json();
        const { contact, cartItems, totalAmount, shippingMethod } = body;

        // 0. Server-side Validation
        if (!contact || !contact.email || !contact.firstName || !contact.lastName || !contact.address || !contact.city || !contact.zip) {
            return NextResponse.json({ error: 'Missing required contact information' }, { status: 400 });
        }

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // 1. Validate items and stock
        // We re-fetch prices and stock from DB to prevent tampering
        const variantIds = cartItems.map((item: any) => item.variantId);
        const dbVariants = await prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: { product: true }
        });

        const orderItemsData: OrderItemData[] = [];
        let calculatedSubtotal = 0;

        for (const item of cartItems) {
            const variant = dbVariants.find(v => v.id === item.variantId);

            if (!variant) {
                return NextResponse.json({ error: `Product variant not found` }, { status: 400 });
            }

            if (variant.stock < item.quantity) {
                return NextResponse.json({ error: `Insufficient stock for ${variant.product.name} (${variant.size})` }, { status: 400 });
            }

            // Use basePrice to match what is shown in UI and Cart
            const unitPrice = Number(variant.product.basePrice);
            const lineTotal = unitPrice * item.quantity;
            calculatedSubtotal += lineTotal;

            orderItemsData.push({
                variantId: variant.id,
                productName: variant.product.name,
                sku: variant.sku,
                size: variant.size,
                color: variant.color,
                quantity: item.quantity,
                unitPrice: unitPrice,
                totalPrice: lineTotal
            });
        }

        const standardShippingFee = 0;
        const shippingCost = shippingMethod === 'standard' ? standardShippingFee : shippingMethod === 'express' ? 45 : 65;
        const finalTotal = calculatedSubtotal + shippingCost;

        // 2. Create Order Transaction
        const order = await prisma.$transaction(async (tx) => {
            // A. Create Order
            const newOrder = await tx.order.create({
                data: {
                    orderNumber: `ORD-${Date.now()}`, // Simple ID generation
                    guestEmail: contact.email,
                    userId: (session?.user as any)?.id || null,
                    status: 'PENDING',
                    totalAmount: finalTotal,
                    shippingCost: shippingCost,
                    shippingAddress: contact, // Storing full JSON snapshot
                    billingAddress: contact,  // Using same for now
                    items: {
                        create: orderItemsData
                    }
                }
            });

            // B. Decrement Stock
            for (const item of orderItemsData) {
                await tx.productVariant.update({
                    where: { id: item.variantId! },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            // C. Create Payment Record (Mock)
            await tx.payment.create({
                data: {
                    orderId: newOrder.id,
                    provider: 'Stripe Mock',
                    status: 'COMPLETED',
                    amount: finalTotal,
                    currency: 'USD',
                    transactionId: `txn_${Date.now()}`
                }
            });

            return newOrder;
        });

        return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.orderNumber });

    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            where: {
                userId: (session.user as any).id
            },
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
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Fetch orders error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
