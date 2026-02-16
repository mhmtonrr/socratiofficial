export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const products = await prisma.product.findMany({
            include: {
                category: true,
                images: true,
                variants: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, slug, description, basePrice, categoryId, images, variants, details, care } = body;

        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                basePrice,
                categoryId,
                details,
                care,
                images: {
                    create: images.map((img: any) => ({
                        url: img.url,
                        isMain: img.isMain || false,
                    }))
                },
                variants: {
                    create: variants.map((v: any) => ({
                        sku: v.sku || `${slug}-${v.color}-${v.size}-${Math.random().toString(36).substring(2, 7)}`.toLowerCase().replace(/\s+/g, '-'),
                        size: v.size,
                        color: v.color,
                        colorHex: v.colorHex,
                        stock: v.stock || 0,
                        price: v.price || basePrice,
                    }))
                }
            },
            include: {
                images: true,
                variants: true,
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("Product creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
