import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Find user by token and ensure token is not expired
        const user = await prisma.user.findUnique({
            where: { resetToken: token },
        });

        if (!user || !user.resetTokenExp || user.resetTokenExp < new Date()) {
            return NextResponse.json({ error: 'Invalid or expired password reset token' }, { status: 400 });
        }

        // Token is valid, hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update user, clear the token so it cannot be reused
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExp: null,
            },
        });

        return NextResponse.json({ success: true, message: 'Password has been successfully reset.' });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
