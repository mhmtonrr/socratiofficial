import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { action, ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No products selected" }, { status: 400 });
        }

        switch (action) {
            case 'delete':
                // Clean variants and images first since Prisma might require it if no Cascade is set manually
                await prisma.productImage.deleteMany({ where: { productId: { in: ids } } });
                await prisma.productVariant.deleteMany({ where: { productId: { in: ids } } });
                await prisma.product.deleteMany({ where: { id: { in: ids } } });
                break;
            case 'activate':
                await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: true } });
                break;
            case 'deactivate':
                await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: false } });
                break;
            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: `Bulk action '${action}' completed.` });
    } catch (error) {
        console.error("Bulk action error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
