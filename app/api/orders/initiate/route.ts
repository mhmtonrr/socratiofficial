/**
 * POST /api/orders/initiate
 *
 * Step 1 of the Payfast checkout flow:
 * 1. Validates cart items against DB (prices, stock)
 * 2. Optionally creates a user account (guest checkout with createAccount=true)
 * 3. Creates an Order with status PENDING
 * 4. Creates a Payment record with status PENDING
 * 5. Returns Payfast form data + MD5 signature
 *
 * Stock is only decremented when Payfast confirms payment via ITN (/api/payfast/notify)
 */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buildPayfastFormData, PAYFAST_CONFIG } from '@/lib/payfast';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await request.json();
        const { contact, cartItems, shippingMethod, couponCode } = body;

        // ── 1. Validate input ────────────────────────────────────────────────
        if (!contact?.email || !contact?.firstName || !contact?.lastName || !contact?.address || !contact?.city || !contact?.zip) {
            return NextResponse.json({ error: 'Missing required contact information' }, { status: 400 });
        }

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // ── 2. Validate items & prices against DB ────────────────────────────
        const variantIds = cartItems.map((item: any) => item.variantId);
        const dbVariants = await prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: { product: true },
        });

        const orderItemsData: any[] = [];
        let calculatedSubtotal = 0;

        for (const item of cartItems) {
            const variant = dbVariants.find((v) => v.id === item.variantId);

            if (!variant) {
                return NextResponse.json({ error: 'Product variant not found' }, { status: 400 });
            }

            if (variant.stock < item.quantity) {
                return NextResponse.json(
                    { error: `Insufficient stock for ${variant.product.name} (Size: ${variant.size})` },
                    { status: 400 }
                );
            }

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
                unitPrice,
                totalPrice: lineTotal,
            });
        }

        // ── 3. Calculate shipping & Discounts ────────────────────────────────────────────
        const standardShippingFee = calculatedSubtotal > 5000 ? 0 : 250;
        const shippingCost =
            shippingMethod === 'express' ? 450
            : shippingMethod === 'overnight' ? 650
            : standardShippingFee;

        let discountValue = 0;
        let validCouponId = null;

        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
            if (coupon && coupon.isActive) {
                // simple validation
                const now = new Date();
                const isValidDate = (!coupon.startDate || coupon.startDate <= now) && (!coupon.endDate || coupon.endDate >= now);
                const isUnderLimit = !coupon.maxUses || coupon.currentUses < coupon.maxUses;
                const meetsMinOrder = !coupon.minOrderValue || calculatedSubtotal >= Number(coupon.minOrderValue);

                if (isValidDate && isUnderLimit && meetsMinOrder) {
                    validCouponId = coupon.id;
                    if (coupon.type === 'PERCENTAGE') {
                        discountValue = (calculatedSubtotal * Number(coupon.value)) / 100;
                    } else {
                        discountValue = Number(coupon.value);
                    }
                    if (discountValue > calculatedSubtotal) discountValue = calculatedSubtotal;
                }
            }
        }

        const finalTotal = Math.max(0, calculatedSubtotal - discountValue) + shippingCost;

        // ── 4. Resolve userId (session or create account for guest) ──────────
        const { createAccount, password, saveAddress } = body;
        let userId: string | null = (session?.user as any)?.id || null;
        let isNewAccount = false;

        if (!userId) {
            // Guest must provide a password to create an account
            if (!createAccount || !password) {
                return NextResponse.json({ error: 'A password is required to place an order' }, { status: 400 });
            }
            if (password.length < 6) {
                return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
            }

            const existingUser = await prisma.user.findUnique({ where: { email: contact.email } });
            if (existingUser) {
                // Account already exists — link order to it
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

        // ── 4b. Save address to user's address book ───────────────────────────
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
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    orderNumber: `ORD-${Date.now()}`,
                    guestEmail: contact.email,
                    userId,
                    status: 'PENDING',
                    totalAmount: finalTotal,
                    shippingCost,
                    discountAmount: discountValue,
                    couponId: validCouponId,
                    shippingAddress: contact,
                    billingAddress: contact,
                    items: { create: orderItemsData },
                },
            });

            await tx.payment.create({
                data: {
                    orderId: newOrder.id,
                    provider: 'Payfast',
                    transactionId: newOrder.orderNumber,
                    status: 'PENDING',
                    amount: finalTotal,
                    currency: 'ZAR',
                },
            });

            return newOrder;
        });

        // ── 6. Build Payfast form data with MD5 signature ────────────────────
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socratiofficial.co.za';

        const payfastData = buildPayfastFormData({
            orderId: order.id,
            orderNumber: order.orderNumber,
            amount: finalTotal,
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
            appUrl,
        });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            orderNumber: order.orderNumber,
            payfastData,
            payfastUrl: PAYFAST_CONFIG.processUrl,
        });

    } catch (error) {
        console.error('Order initiate error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
