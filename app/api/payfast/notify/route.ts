/**
 * POST /api/payfast/notify
 *
 * Payfast Instant Transaction Notification (ITN) handler.
 * Payfast calls this server-to-server after a payment is completed.
 *
 * Security checks (per Payfast docs):
 * 1. Validate the MD5 signature
 * 2. Validate the request comes from a Payfast IP
 * 3. Validate the payment amount matches the order total
 * 4. Server-side confirmation with Payfast
 *
 * On success: marks order PAID, decrements stock, updates payment record.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import {
    validateITNSignature,
    validatePayfastIP,
    validatePaymentAmount,
    confirmWithPayfast,
    buildITNParamString,
} from '@/lib/payfast';

export async function POST(request: NextRequest) {
    try {
        // ── 1. Parse the ITN body (URL-encoded) ─────────────────────────────
        const rawBody = await request.text();
        const params = new URLSearchParams(rawBody);
        const pfData: Record<string, string> = {};
        params.forEach((value, key) => { pfData[key] = value; });

        console.log('[Payfast ITN] Received:', pfData);

        // ── 2. Security Check 1: Validate signature ──────────────────────────
        const signatureValid = validateITNSignature(pfData);
        if (!signatureValid) {
            console.error('[Payfast ITN] Signature validation FAILED');
            return new NextResponse('Invalid signature', { status: 400 });
        }

        // ── 3. Security Check 2: Validate source IP ──────────────────────────
        const forwardedFor = request.headers.get('x-forwarded-for');
        const remoteAddr = request.headers.get('x-real-ip') || '127.0.0.1';
        const pfIp = forwardedFor ? forwardedFor.split(',')[0].trim() : remoteAddr;

        const ipValid = await validatePayfastIP(pfIp);
        if (!ipValid) {
            console.error('[Payfast ITN] Invalid IP:', pfIp);
            return new NextResponse('Invalid IP', { status: 400 });
        }

        // ── 4. Find the Order ────────────────────────────────────────────────
        const orderId = pfData['custom_str1'];
        const orderNumber = pfData['m_payment_id'];

        if (!orderId && !orderNumber) {
            console.error('[Payfast ITN] No order identifier in ITN');
            return new NextResponse('Missing order reference', { status: 400 });
        }

        const order = await prisma.order.findFirst({
            where: orderId ? { id: orderId } : { orderNumber },
            include: { items: true, payment: true },
        });

        if (!order) {
            console.error('[Payfast ITN] Order not found:', orderId || orderNumber);
            return new NextResponse('Order not found', { status: 404 });
        }

        // ── 5. Security Check 3: Validate amount ─────────────────────────────
        const amountValid = validatePaymentAmount(
            Number(order.totalAmount),
            pfData['amount_gross'] || '0'
        );
        if (!amountValid) {
            console.error('[Payfast ITN] Amount mismatch. Expected:', Number(order.totalAmount), 'Got:', pfData['amount_gross']);
            return new NextResponse('Amount mismatch', { status: 400 });
        }

        // ── 6. Security Check 4: Server confirmation with Payfast ─────────────
        const pfParamString = buildITNParamString(pfData);
        const serverConfirmed = await confirmWithPayfast(pfParamString);
        if (!serverConfirmed) {
            console.error('[Payfast ITN] Server confirmation FAILED');
            return new NextResponse('Server confirmation failed', { status: 400 });
        }

        // ── 7. All checks passed — update order based on payment_status ───────
        const paymentStatus = pfData['payment_status'];

        if (paymentStatus === 'COMPLETE') {
            await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                await tx.order.update({
                    where: { id: order.id },
                    data: { status: 'PAID' },
                });

                await tx.payment.update({
                    where: { orderId: order.id },
                    data: {
                        status: 'COMPLETED',
                        pfPaymentId: pfData['pf_payment_id'],
                        transactionId: pfData['m_payment_id'],
                    },
                });

                for (const item of order.items) {
                    if (item.variantId) {
                        await tx.productVariant.update({
                            where: { id: item.variantId },
                            data: { stock: { decrement: item.quantity } },
                        });
                    }
                }
            });

            console.log('[Payfast ITN] ✅ Order PAID:', order.orderNumber);

        } else if (paymentStatus === 'CANCELLED') {
            await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                await tx.order.update({
                    where: { id: order.id },
                    data: { status: 'CANCELLED' },
                });
                await tx.payment.update({
                    where: { orderId: order.id },
                    data: { status: 'FAILED' },
                });
            });

            console.log('[Payfast ITN] ❌ Order CANCELLED:', order.orderNumber);
        }

        // ── 8. Return 200 to prevent ITN retries ──────────────────────────────
        return new NextResponse('OK', { status: 200 });

    } catch (error) {
        console.error('[Payfast ITN] Unhandled error:', error);
        // Return 200 anyway to prevent endless retries — investigate manually
        return new NextResponse('OK', { status: 200 });
    }
}
