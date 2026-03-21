/**
 * POST /api/orders/peach/initiate
 *
 * Step 1 of the Peach Payments embedded checkout flow:
 * 1. Validates cart items against DB (prices, stock)
 * 2. Optionally creates a user account (guest with password)
 * 3. Creates Order (PENDING) + Payment (PENDING)
 * 4. Creates a Peach Payments checkout instance
 * 5. Returns { checkoutId, entityId, orderId, orderNumber }
 *
 * Stock is decremented when Peach confirms via notify webhook (/api/peach/notify)
 */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPeachCheckout } from '@/lib/peach';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await request.json();
        const { contact, cartItems, shippingMethod } = body;

        // ── 1. Validate input ────────────────────────────────────────────────
        if (!contact?.email || !contact?.firstName || !contact?.lastName || !contact?.address || !contact?.city || !contact?.zip) {
            return NextResponse.json({ error: 'Missing required contact information' }, { status: 400 });
        }

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // ── 2. Validate & price cart items from DB ───────────────────────────
        const variantIds: string[] = cartItems.map((item: any) => item.variantId);
        const dbVariants = await prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: { product: true },
        });

        const orderItemsData: any[] = [];
        let calculatedSubtotal = 0;

        for (const cartItem of cartItems) {
            const variant = dbVariants.find((v: any) => v.id === cartItem.variantId);
            if (!variant) return NextResponse.json({ error: `Product variant not found: ${cartItem.variantId}` }, { status: 400 });

            const unitPrice = Number(variant.price || variant.product.basePrice);
            const lineTotal = unitPrice * cartItem.quantity;
            calculatedSubtotal += lineTotal;

            orderItemsData.push({
                variantId: variant.id,
                productName: variant.product.name,
                sku: variant.sku || `${variant.productId}-${variant.id}`,
                color: variant.color,
                size: variant.size,
                quantity: cartItem.quantity,
                unitPrice,
                totalPrice: lineTotal,
            });
        }

        // ── 3. Calculate shipping ─────────────────────────────────────────────
        const standardShippingFee = calculatedSubtotal > 5000 ? 0 : 250;
        const shippingCost =
            shippingMethod === 'express' ? 450
            : shippingMethod === 'overnight' ? 650
            : standardShippingFee;
        const finalTotal = calculatedSubtotal + shippingCost;

        // ── 4. Resolve userId (session or create account for guest) ──────────
        const { createAccount, password, saveAddress } = body;
        let userId: string | null = (session?.user as any)?.id || null;
        let isNewAccount = false;

        if (!userId) {
            if (!createAccount || !password) {
                return NextResponse.json({ error: 'A password is required to place an order' }, { status: 400 });
            }
            if (password.length < 6) {
                return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
            }

            const existingUser = await prisma.user.findUnique({ where: { email: contact.email } });
            if (existingUser) {
                userId = existingUser.id;
            } else {
                const hashedPassword = await bcrypt.hash(password, 12);
                const newUser = await prisma.user.create({
                    data: {
                        email: contact.email,
                        password: hashedPassword,
                        firstName: contact.firstName,
                        lastName: contact.lastName,
                    },
                });
                userId = newUser.id;
                isNewAccount = true;
            }
        }

        // ── 4b. Save address ─────────────────────────────────────────────────
        const shouldSave = isNewAccount || saveAddress === true;
        if (userId && shouldSave) {
            const addressCount = await prisma.address.count({ where: { userId } });
            const duplicate = await prisma.address.findFirst({
                where: { userId, street: contact.address, city: contact.city },
            });
            if (!duplicate) {
                const makeDefault = addressCount === 0;
                if (makeDefault) {
                    await prisma.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
                }
                await prisma.address.create({
                    data: {
                        userId,
                        title: isNewAccount ? 'Home' : 'Delivery Address',
                        firstName: contact.firstName,
                        lastName: contact.lastName,
                        phone: contact.phone || '',
                        street: contact.address,
                        addressLine2: contact.addressLine2 || '',
                        city: contact.city,
                        state: contact.state || '',
                        zipCode: contact.zip,
                        country: contact.country || 'South Africa',
                        isDefault: makeDefault,
                    },
                });
            }
        }

        // ── 5. Create Order (PENDING) + Payment (PENDING) ────────────────────
        const order = await prisma.$transaction(async (tx: any) => {
            const newOrder = await tx.order.create({
                data: {
                    orderNumber: `ORD-${Date.now()}`,
                    guestEmail: contact.email,
                    userId,
                    status: 'PENDING',
                    totalAmount: finalTotal,
                    shippingCost,
                    shippingAddress: contact,
                    billingAddress: contact,
                    items: { create: orderItemsData },
                },
            });

            await tx.payment.create({
                data: {
                    orderId: newOrder.id,
                    provider: 'Peach',
                    transactionId: newOrder.orderNumber,
                    status: 'PENDING',
                    amount: finalTotal,
                    currency: 'ZAR',
                },
            });

            return newOrder;
        });

        // ── 6. Create Peach checkout instance ─────────────────────────────────
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const { checkoutId } = await createPeachCheckout({
            merchantTransactionId: order.orderNumber,
            amount: finalTotal,
            currency: 'ZAR',
            shopperResultUrl: `${appUrl}/order-success?orderNumber=${encodeURIComponent(order.orderNumber)}`,
            notificationUrl: `${appUrl}/api/peach/notify`,
            customerEmail: contact.email,
            customerFirstName: contact.firstName,
            customerLastName: contact.lastName,
            billingStreet: contact.address,
            billingCity: contact.city,
            billingState: contact.state,
            billingPostcode: contact.zip,
            billingCountry: 'ZA',
        });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            orderNumber: order.orderNumber,
            checkoutId,
            entityId: process.env.NEXT_PUBLIC_PEACH_ENTITY_ID,
        });

    } catch (error) {
        console.error('Peach initiate error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
