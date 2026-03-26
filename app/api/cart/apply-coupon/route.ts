import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { code, cartTotal } = await req.json();

        if (!code || !cartTotal) {
            return NextResponse.json({ error: 'Code and Cart Total are required' }, { status: 400 });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 });
        }

        const now = new Date();
        if (coupon.startDate && coupon.startDate > now) {
            return NextResponse.json({ error: 'This coupon is not valid yet' }, { status: 400 });
        }

        if (coupon.endDate && coupon.endDate < now) {
            return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
        }

        if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
            return NextResponse.json({ error: 'This coupon usage limit has been reached' }, { status: 400 });
        }

        if (coupon.minOrderValue && cartTotal < Number(coupon.minOrderValue)) {
            return NextResponse.json({ error: `Cart total must be at least R${coupon.minOrderValue} to use this coupon` }, { status: 400 });
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.type === 'PERCENTAGE') {
            discountAmount = (cartTotal * Number(coupon.value)) / 100;
        } else {
            discountAmount = Number(coupon.value);
        }

        // Cap discount to cartTotal (can't have negative final price)
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }

        return NextResponse.json({
            success: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                type: coupon.type,
                value: Number(coupon.value),
            },
            discountAmount
        });

    } catch (error) {
        console.error('Apply coupon error:', error);
        return NextResponse.json({ error: 'Internal server error while applying coupon' }, { status: 500 });
    }
}
