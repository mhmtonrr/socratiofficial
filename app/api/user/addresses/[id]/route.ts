
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const address = await prisma.address.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!address || address.user.email !== session.user.email) {
            return NextResponse.json({ error: "Address not found" }, { status: 404 });
        }

        return NextResponse.json(address);
    } catch (error) {
        console.error("Fetch address error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { title, firstName, lastName, phone, street, addressLine2, city, state, zipCode, country, isDefault } = data;

        const address = await prisma.address.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!address || address.user.email !== session.user.email) {
            return NextResponse.json({ error: "Address not found" }, { status: 404 });
        }

        // If setting as default, unset others
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: address.userId },
                data: { isDefault: false }
            });
        }

        const updatedAddress = await prisma.address.update({
            where: { id },
            data: {
                title,
                type: "SHIPPING", // Re-added for compatibility
                firstName,
                lastName,
                phone,
                street,
                addressLine2,
                city,
                state,
                zipCode,
                country,
                isDefault
            }
        });

        return NextResponse.json(updatedAddress);
    } catch (error) {
        console.error("Update address error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const address = await prisma.address.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!address || address.user.email !== session.user.email) {
            return NextResponse.json({ error: "Address not found" }, { status: 404 });
        }

        await prisma.address.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete address error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
