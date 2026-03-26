import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const original = await prisma.product.findUnique({
            where: { id },
            include: {
                images: true,
                variants: true
            }
        });

        if (!original) {
            return NextResponse.json({ error: "Original product not found" }, { status: 404 });
        }

        const newSlug = `${original.slug}-copy-${Math.random().toString(36).substring(2, 7)}`;

        const duplicate = await prisma.product.create({
            data: {
                name: `${original.name} (Copy)`,
                slug: newSlug,
                description: original.description,
                basePrice: original.basePrice,
                isActive: false, // Default to false so they can review before publishing
                categoryId: original.categoryId,
                care: original.care,
                details: original.details,
                salePrice: original.salePrice,
                saleStartDate: original.saleStartDate,
                saleEndDate: original.saleEndDate,
                tags: original.tags,
                images: {
                    create: original.images.map(img => ({
                        url: img.url,
                        altText: img.altText,
                        isMain: img.isMain,
                        color: img.color
                    }))
                },
                variants: {
                    create: original.variants.map(v => ({
                        sku: `${original.slug}-copy-${v.color}-${v.size}-${Math.random().toString(36).substring(2, 7)}`.toLowerCase().replace(/\s+/g, '-'),
                        size: v.size,
                        color: v.color,
                        colorHex: v.colorHex,
                        stock: v.stock,
                        price: v.price
                    }))
                }
            }
        });

        return NextResponse.json(duplicate);
    } catch (error) {
        console.error("Duplicate error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
