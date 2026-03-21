
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const addresses = await prisma.address.findMany({
            where: { user: { email: session.user.email! } },
            orderBy: { isDefault: 'desc' },
        });

        return NextResponse.json(addresses);
    } catch (error) {
        console.error("Fetch addresses error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { title, firstName, lastName, phone, street, addressLine2, city, state, zipCode, country, isDefault } = data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // If this is set as default, unset other defaults
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: user.id },
                data: { isDefault: false }
            });
        }

        const address = await prisma.address.create({
            data: {
                userId: user.id,
                title,
                type: "SHIPPING", // Required for stale client compatibility
                firstName,
                lastName,
                phone,
                street,
                addressLine2,
                city,
                state,
                zipCode,
                country: country || "South Africa",
                isDefault: !!isDefault
            }
        });

        return NextResponse.json(address);
    } catch (error) {
        console.error("Create address error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
