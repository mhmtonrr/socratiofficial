
import { Metadata } from 'next';
import { prisma } from '../../lib/prisma';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';

export const metadata: Metadata = {
    title: "Men's Collection | Socrati Official",
    description: "Discover artisanal Italian men's footwear. From classic formal shoes to contemporary sneakers, crafted for the modern man.",
};

interface PageProps {
    searchParams: Promise<{
        q?: string;
        category?: string;
        size?: string;
        color?: string;
        maxPrice?: string;
        sort?: string;
    }>;
}

export default async function MenPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const { q, category, size, color, maxPrice, sort } = params;

    // Parse multi-select params
    const selectedCategories = category ? category.split(',') : [];
    const selectedSizes = size ? size.split(',') : [];
    const selectedColors = color ? color.split(',') : [];

    // 1. Fetch all variants first to build filters and mapping
    const allVariants = await prisma.productVariant.findMany({
        where: {
            product: {
                OR: [
                    { category: { parent: { slug: 'men' } } },
                    { category: { parent: { parent: { slug: 'men' } } } }
                ]
            }
        },
        select: { size: true, color: true, colorHex: true }
    });

    // 2. Build the where clause
    let finalWhere: any = {
        AND: [
            {
                OR: [
                    { category: { parent: { slug: 'men' } } },
                    { category: { parent: { parent: { slug: 'men' } } } }
                ]
            }
        ]
    };

    // Text search filter
    if (q) {
        finalWhere.AND.push({
            OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { category: { name: { contains: q, mode: 'insensitive' } } }
            ]
        });
    }

    // Filter by specific sub-categories if selected
    if (selectedCategories.length > 0) {
        finalWhere.category = { slug: { in: selectedCategories } };
    }

    if (maxPrice) {
        finalWhere.basePrice = { lte: parseFloat(maxPrice) };
    }

    if (selectedSizes.length > 0 || selectedColors.length > 0) {
        const colorHexesToFilter = allVariants
            .filter(v => v.color && selectedColors.includes(v.color))
            .map(v => v.colorHex)
            .filter((h): h is string => h !== null);

        finalWhere.variants = {
            some: {
                ...(selectedSizes.length > 0 && { size: { in: selectedSizes } }),
                ...(colorHexesToFilter.length > 0 && { colorHex: { in: colorHexesToFilter } }),
                stock: { gt: 0 }
            }
        };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { basePrice: 'asc' };
    if (sort === 'price-desc') orderBy = { basePrice: 'desc' };

    const [products, categoryCounts] = await Promise.all([
        prisma.product.findMany({
            where: finalWhere,
            include: {
                category: true,
                images: true,
                variants: true
            },
            orderBy
        }),
        prisma.category.findMany({
            where: {
                OR: [
                    { parent: { slug: 'men' } },
                    { parent: { parent: { slug: 'men' } } }
                ],
                products: { some: {} } // Only show categories with actual products
            },
            include: { _count: { select: { products: true } } }
        })
    ]);

    const uniqueSizes = Array.from(new Set(allVariants.map(v => v.size).filter((s): s is string => s !== null))).sort((a, b) => parseFloat(a) - parseFloat(b));
    // Deduplicate colors by Hex code to stop duplicate visual entries
    const uniqueColorsMap = new Map<string, { name: string; hex: string | null }>();
    allVariants.forEach(v => {
        if (v.color && v.colorHex) {
            const hexKey = v.colorHex.toLowerCase().trim();
            if (!uniqueColorsMap.has(hexKey)) {
                uniqueColorsMap.set(hexKey, { name: v.color, hex: v.colorHex });
            }
        }
    });
    const uniqueColors = Array.from(uniqueColorsMap.values());
    const globalMaxPrice = 5000;

    return (
        <div className="bg-[#FCFCFC] min-h-screen">
            <Header />

            <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden group">
                <Image
                    alt="Luxury men's collection"
                    className="w-full h-full object-cover object-[center_15%] transition-transform duration-[3s] group-hover:scale-105"
                    src="/images/men.png"
                    fill
                    priority
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                    <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight mb-4 text-center drop-shadow-lg opacity-0 animate-fade-in-up">
                        Men's Collection
                    </h1>
                    <p className="text-xs md:text-sm uppercase tracking-[0.3em] font-bold border-t border-white/40 pt-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Sophisticated Style & Heritage
                    </p>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row justify-between items-center border-b border-gray-100">
                <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-4 sm:mb-0">
                    <Link className="hover:text-primary transition-colors" href="/">Home</Link> <span className="mx-2">/</span>
                    <span className="text-text-main-light font-bold">Men</span>
                    {category && (
                        <>
                            <span className="mx-2">/</span>
                            <span className="text-primary font-bold">{category}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-10">
                    <span className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">{products.length} Products</span>
                    <div className="relative group">
                        <button className="flex items-center text-[10px] font-bold uppercase tracking-[0.3em] hover:text-primary transition-colors">
                            Sort By <ChevronDown className="ml-2 w-3 h-3" />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                            <div className="py-2">
                                <Link
                                    href={`/men?${new URLSearchParams({ ...params, sort: 'newest' }).toString()}`}
                                    className="block px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-gray-50 text-gray-600"
                                >
                                    Newest Arrivals
                                </Link>
                                <Link
                                    href={`/men?${new URLSearchParams({ ...params, sort: 'price-asc' }).toString()}`}
                                    className="block px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-gray-50 text-gray-600"
                                >
                                    Price: Low to High
                                </Link>
                                <Link
                                    href={`/men?${new URLSearchParams({ ...params, sort: 'price-desc' }).toString()}`}
                                    className="block px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-gray-50 text-gray-600"
                                >
                                    Price: High to Low
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-4 sm:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-3">
                    <FilterSidebar
                        categories={categoryCounts}
                        sizes={uniqueSizes}
                        colors={uniqueColors}
                        maxPrice={globalMaxPrice}
                    />
                </div>

                <main className="lg:col-span-9">
                    {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <p className="text-gray-400 font-serif italic text-xl mb-6">No matches found explore our other styles.</p>
                            <Link href="/men" className="text-[11px] uppercase tracking-widest underline underline-offset-8 font-bold hover:text-primary transition-colors">
                                View Full Collection
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                            {products.map((product) => (
                                <Link key={product.id} href={`/product/${product.id}`} className="group drop-shadow-sm hover:drop-shadow-md transition-all">
                                    <div className="relative overflow-hidden bg-[#F0F0F0] aspect-square mb-6 shadow-inner">
                                        {product.images[0] && (
                                            <Image
                                                alt={product.name}
                                                className="object-cover w-full h-full transition-transform duration-[2s] group-hover:scale-105"
                                                src={product.images.find(i => i.isMain)?.url || product.images[0].url}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-1 px-1">
                                        <p className="text-[9px] text-primary font-bold uppercase tracking-[0.2em]">{product.category.name}</p>
                                        <h3 className="text-base font-serif text-text-main-light group-hover:text-primary transition-colors leading-snug">{product.name}</h3>
                                        <p className="text-sm font-light text-gray-500 tracking-tight">R {Number(product.basePrice).toLocaleString()}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
}
