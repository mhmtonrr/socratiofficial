import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/emails';
import { buildPasswordResetEmail } from '@/lib/email-templates';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Do not reveal if the user exists for security reasons
            return NextResponse.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
        }

        // Generate a random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExp = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiration

        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExp },
        });

        // Send Email
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socratiofficial.co.za';
        const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

        await sendEmail({
            to: user.email,
            subject: 'Socrati - Password Reset Request',
            html: buildPasswordResetEmail(resetLink),
        });

        return NextResponse.json({ success: true, message: 'If the email exists, a reset link has been sent.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
