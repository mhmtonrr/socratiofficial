/**
 * POST /api/peach/notify
 *
 * Peach Payments webhook — called when a payment is completed, failed, etc.
 * Updates Order status and Payment status in the DB.
 * Decrements stock on successful payment.
 *
 * Peach sends a POST with application/x-www-form-urlencoded body.
 * Signature verification is via an HMAC-SHA256 hash of the sorted query params.
 */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail, checkAndNotifyLowStock } from '@/lib/emails';
import { buildOrderConfirmationEmail, buildAdminNewOrderEmail } from '@/lib/email-templates';

// Result codes that indicate a successful payment
// https://developer.peachpayments.com/docs/result-codes
const SUCCESS_CODES = /^(000\.000\.|000\.100\.1|000\.[36])/;
const PENDING_CODES = /^(000\.200)/;

function verifySignature(params: Record<string, string>, secret: string): boolean {
    // Peach signature: HMAC-SHA256 of sorted key=value pairs joined by &
    const { signature, ...rest } = params;
    const sorted = Object.keys(rest)
        .sort()
        .map((k) => `${k}=${rest[k]}`)
        .join('&');
    const expected = crypto.createHmac('sha256', secret).update(sorted).digest('hex');
    return expected === signature;
}

export async function POST(request: Request) {
    try {
        const contentType = request.headers.get('content-type') ?? '';
        let params: Record<string, string> = {};

        if (contentType.includes('application/x-www-form-urlencoded')) {
            const text = await request.text();
            const urlParams = new URLSearchParams(text);
            urlParams.forEach((v, k) => { params[k] = v; });
        } else {
            // Fallback: try JSON
            params = await request.json();
        }

        // ── 1. Signature verification (skip in sandbox if no secret set) ─────
        const secret = process.env.PEACH_CLIENT_SECRET;
        if (secret && params.signature) {
            if (!verifySignature(params, secret)) {
                console.warn('Peach notify: invalid signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
            }
        }

        const resultCode: string = params['result.code'] ?? '';
        const merchantTransactionId: string = params.merchantTransactionId ?? '';
        const peachTransactionId: string = params.id ?? params.transactionId ?? '';

        if (!merchantTransactionId) {
            return NextResponse.json({ error: 'Missing merchantTransactionId' }, { status: 400 });
        }

        // ── 2. Find order ─────────────────────────────────────────────────────
        const order = await prisma.order.findFirst({
            where: { orderNumber: merchantTransactionId },
            include: { items: true, payment: true, user: true },
        });

        if (!order) {
            console.warn(`Peach notify: Order not found: ${merchantTransactionId}`);
            return NextResponse.json({ received: true }); // return 200 to stop retries
        }

        // ── 3. Determine new statuses ─────────────────────────────────────────
        const isSuccess = SUCCESS_CODES.test(resultCode);
        const isPending = PENDING_CODES.test(resultCode);

        const newOrderStatus = isSuccess ? 'PAID' : isPending ? 'PENDING' : 'CANCELLED';
        const newPaymentStatus = isSuccess ? 'COMPLETED' : isPending ? 'PENDING' : 'FAILED';

        // ── 4. Update Order + Payment ─────────────────────────────────────────
        await prisma.$transaction(async (tx: any) => {
            await tx.order.update({
                where: { id: order.id },
                data: { status: newOrderStatus },
            });

            // Update the Peach payment record
            const payment = order.payment;
            if (payment && payment.provider === 'Peach') {
                await tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: newPaymentStatus,
                        transactionId: peachTransactionId || payment.transactionId,
                    },
                });
            }

            // ── 5. Decrement stock & Increment coupon on success ─────────────────────────────────
            if (isSuccess) {
                for (const item of order.items as any[]) {
                    if (item.variantId) {
                        await tx.productVariant.update({
                            where: { id: item.variantId },
                            data: { stock: { decrement: item.quantity } },
                        });
                        await tx.stockHistory.create({
                            data: {
                                variantId: item.variantId,
                                change: -item.quantity,
                                reason: `Order Placed: ${order.orderNumber}`
                            }
                        });
                    }
                }

                // Increment coupon usage if there is one
                if ((order as any).couponId) {
                    await tx.coupon.update({
                        where: { id: (order as any).couponId },
                        data: { currentUses: { increment: 1 } },
                    });
                }
            }
        });

        // 5b. Low stock check AFTER transaction
        if (isSuccess) {
            for (const item of order.items as any[]) {
                if (item.variantId) {
                    await checkAndNotifyLowStock(item.variantId);
                }
            }
        }

        console.log(`Peach notify: Order ${merchantTransactionId} → ${newOrderStatus} (code: ${resultCode})`);

        // ── 6. Send Email if Paid ────────────────────────────────────────────────
        if (isSuccess && order.status !== 'PAID') {
            const customerEmail = order.guestEmail || order.user?.email;
            const customerName = order.user?.firstName || 'Customer';

            if (customerEmail) {
                const html = buildOrderConfirmationEmail(order as any, customerName);
                await sendEmail({
                    to: customerEmail,
                    subject: `Order Confirmation - ${order.orderNumber}`,
                    html,
                });
                console.log(`[Peach notify] 📧 Confirmation email sent to ${customerEmail}`);
                // ── Send Notification to Admin ────────────────────────────────────
                const adminEmail = process.env.ADMIN_EMAIL;
                if (adminEmail) {
                    await sendEmail({
                        to: adminEmail,
                        subject: `New Order Received: ${order.orderNumber}`,
                        html: buildAdminNewOrderEmail(order as any, customerName, customerEmail),
                    });
                    console.log(`[Peach notify] 🚨 Admin notification sent to ${adminEmail}`);
                }
            }
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Peach notify error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
