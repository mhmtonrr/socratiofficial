
import { prisma } from '../../lib/prisma';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export default async function BagsPage() {
    // Current requirement: "We won't sell bags initially", but page should exist.
    // Fetch global bags category
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { category: { slug: 'bags' } },
                { category: { slug: 'women-bags' } }
            ]
        },
        include: {
            category: true,
            images: true,
            variants: true
        }
    });

    return (
        <>
            <Header />
            <div className="relative h-[300px] w-full overflow-hidden bg-surface-light">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-text-main-light">
                    <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-4">Bags Collection</h1>
                    <p className="text-sm uppercase tracking-widest opacity-60">Coming Soon</p>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12">
                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 font-serif italic">Our luxury bag collection will be available soon.</p>
                        <Link href="/" className="inline-block mt-8 text-[11px] uppercase tracking-widest underline underline-offset-8 hover:text-primary transition-colors">Return Home</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                        {products.map((product) => (
                            <Link key={product.id} href={`/product/${product.id}`} className="group cursor-pointer">
                                <div className="relative overflow-hidden bg-[#F9F9F9] aspect-[4/5] mb-6">
                                    {product.images[0] && (
                                        <Image
                                            alt={product.name}
                                            className="object-cover w-full h-full transform transition-transform duration-1000 group-hover:scale-110"
                                            src={product.images.find(i => i.isMain)?.url || product.images[0].url}
                                            fill
                                        />
                                    )}
                                </div>
                                <div className="text-center">
                                    <h3 className="text-md font-serif text-text-main-light group-hover:text-primary transition-colors mb-1">{product.name}</h3>
                                    <p className="text-sm font-light text-gray-500">${Number(product.basePrice)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}
