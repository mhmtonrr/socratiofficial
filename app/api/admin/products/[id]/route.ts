export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        // Relationları temizle (Veya Cascade delete varsa schema'da gerekmez ama prisma genelde manuel ister)
        await prisma.productImage.deleteMany({ where: { productId: id } });
        await prisma.productVariant.deleteMany({ where: { productId: id } });

        await prisma.product.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }
        const body = await req.json();
        const { name, slug, description, basePrice, categoryId, images, variants, details, care } = body;

        // Update product
        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                slug,
                description,
                basePrice,
                categoryId,
                details,
                care,
            }
        });

        // Handle images update (Simple way: delete and recreate)
        if (images) {
            await prisma.productImage.deleteMany({ where: { productId: id } });
            await prisma.productImage.createMany({
                data: images.map((img: any) => ({
                    url: img.url,
                    isMain: img.isMain || false,
                    productId: id
                }))
            });
        }

        // Handle variants update
        if (variants) {
            await prisma.productVariant.deleteMany({ where: { productId: id } });
            await prisma.productVariant.createMany({
                data: variants.map((v: any) => ({
                    sku: v.sku || `${slug}-${v.color}-${v.size}-${Math.random().toString(36).substring(2, 7)}`.toLowerCase().replace(/\s+/g, '-'),
                    size: v.size,
                    color: v.color,
                    colorHex: v.colorHex,
                    stock: v.stock || 0,
                    price: v.price || basePrice,
                    productId: id
                }))
            });
        }

        return NextResponse.json({ message: "Product updated successfully" });
    } catch (error) {
        console.error("Patch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
