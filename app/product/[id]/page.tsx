import { Metadata, ResolvingMetadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "../../components/ProductDetailClient";

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            images: { where: { isMain: true }, take: 1 },
            category: true
        }
    });

    if (!product) {
        return {
            title: "Product Not Found | Socrati Official",
        };
    }

    const description = product.description.length > 160
        ? product.description.substring(0, 157) + "..."
        : product.description;

    const mainImage = product.images[0]?.url;

    return {
        title: `${product.name} | Socrati Official`,
        description: description,
        openGraph: {
            title: product.name,
            description: description,
            images: mainImage ? [{ url: mainImage, width: 1200, height: 630, alt: product.name }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: description,
            images: mainImage ? [mainImage] : [],
        },
    };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: {
                include: {
                    parent: {
                        include: {
                            parent: true
                        }
                    }
                }
            },
            images: true,
            variants: true,
        },
    });

    if (!product) {
        notFound();
    }

    // Fetch similar products (same category, excluding current)
    const similarProducts = await prisma.product.findMany({
        where: {
            categoryId: product.categoryId,
            id: { not: product.id }
        },
        take: 4,
        include: {
            images: {
                where: { isMain: true },
                take: 1
            },
            category: true
        }
    });

    // Serialize to plain object to handle Prisma Decimal types
    const serializedProduct = JSON.parse(JSON.stringify(product));
    const serializedSimilarProducts = JSON.parse(JSON.stringify(similarProducts));

    return <ProductDetailClient product={serializedProduct} similarProducts={serializedSimilarProducts} />;
}
