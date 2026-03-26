import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/emails";
import { buildVerificationEmail } from "@/lib/email-templates";

export async function POST(req: Request) {
    try {
        const { email, password, firstName, lastName } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Generate random verification token
        const verificationToken = Buffer.from(crypto.randomUUID()).toString("base64");
        const verificationTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                isVerified: false,
                verificationToken,
                verificationTokenExp,
            },
        });

        // ── Send Verification Email ─────────────────────────────────
        try {
            const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
            
            await sendEmail({
                to: user.email,
                subject: "Verify your email - Socrati",
                html: buildVerificationEmail(verificationLink),
            });
            console.log(`[Register API] 📧 Verification email sent to ${user.email}`);
        } catch (emailError) {
            console.error("[Register API] ⚠️ Failed to send welcome email:", emailError);
            // We don't block the registration process if email fails
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
