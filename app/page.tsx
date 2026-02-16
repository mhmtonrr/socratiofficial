import { prisma } from '../lib/prisma';
import Header from './components/Header';
import Footer from './components/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default async function Home() {
    const products = await prisma.product.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: {
            images: true,
            variants: true,
            category: true,
        },
    });

    return (
        <>
            <Header />
            <main className="bg-white">
                {/* Hero Section */}
                <header className="relative w-full h-[85vh] overflow-hidden group">
                    <Image
                        alt="Socrati Official Campaign"
                        className="w-full h-full object-cover object-center transition-transform duration-[2s] ease-in-out group-hover:scale-105"
                        src="/uploads/banner1.png"
                        fill
                        priority
                        quality={100}
                    />
                    <div className="absolute inset-0 bg-black/5 transition-opacity duration-700 group-hover:opacity-0"></div>
                </header>

                {/* Editorial Collection Grid */}
                <section className="py-24 px-4 md:px-8">
                    <div className="max-w-[1800px] mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 px-4">
                            <div>
                                <h3 className="text-4xl md:text-5xl font-serif text-text-main-light mb-4">Curated Collections</h3>
                                <p className="text-sm text-gray-400 uppercase tracking-widest">Designed for the modern sophisticate</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 h-auto md:h-[800px]">
                            {/* Large Item 1 */}
                            <Link href="/women" className="col-span-1 lg:col-span-6 relative h-[500px] md:h-full group overflow-hidden cursor-pointer">
                                <Image
                                    alt="Luxury Heels"
                                    src="/uploads/elegance.png"
                                    fill
                                    className="object-cover object-bottom transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
                                    <h4 className="text-white text-3xl font-serif italic mb-2">Evening Elegance</h4>
                                    <span className="text-white/80 text-xs uppercase tracking-widest">Discover Collection &rarr;</span>
                                </div>
                            </Link>

                            {/* Smaller Grid */}
                            <div className="col-span-1 lg:col-span-6 grid grid-cols-2 gap-4 h-full">
                                <Link href="/men" className="col-span-2 md:col-span-1 relative h-[300px] md:h-auto group overflow-hidden cursor-pointer">
                                    <Image
                                        alt="Men's Formal"
                                        src="/uploads/mensformal.png"
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                        <h4 className="text-white text-xl font-serif tracking-wide border-b border-white pb-2">Men's Formal</h4>
                                    </div>
                                </Link>
                                <Link href="/bags" className="col-span-2 md:col-span-1 relative h-[300px] md:h-auto group overflow-hidden cursor-pointer">
                                    <Image
                                        alt="Luxury Bags"
                                        src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=2535&auto=format&fit=crop"
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                        <h4 className="text-white text-xl font-serif tracking-wide border-b border-white pb-2">Handbags</h4>
                                    </div>
                                </Link>
                                <Link href="/accessories" className="col-span-2 relative h-[300px] md:h-auto group overflow-hidden cursor-pointer">
                                    <Image
                                        alt="Accessories"
                                        src="https://images.unsplash.com/photo-1511556820780-d912e42b4980?q=80&w=2560&auto=format&fit=crop"
                                        fill
                                        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-8">
                                        <h4 className="text-white text-2xl font-serif">Signature Accessories</h4>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* New Arrivals Ticker/Grid */}
                <section className="bg-gray-50 py-24 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <span className="text-primary text-xs font-black uppercase tracking-[0.3em] block mb-4">Just Arrived</span>
                            <h3 className="text-4xl md:text-6xl font-serif text-text-main-light text-stroke">New Season</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                            {products.map((product) => (
                                <Link key={product.id} href={`/product/${product.id}`} className="group cursor-pointer block">
                                    <div className="aspect-[3/4] bg-white mb-6 overflow-hidden relative shadow-sm">
                                        <span className="absolute top-0 left-0 bg-black text-white text-[10px] font-bold uppercase py-2 px-4 z-10">
                                            New
                                        </span>
                                        {product.images[0] && (
                                            <Image
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                src={product.images.find(img => img.isMain)?.url || product.images[0].url}
                                                fill
                                            />
                                        )}
                                        {/* Quick Add Button - appears on hover */}
                                        <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur text-black py-4 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                            <span className="text-xs font-bold uppercase tracking-widest">View Details</span>
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-text-main-light group-hover:text-primary transition-colors">
                                            {product.name}
                                        </h4>
                                        <p className="text-xs text-gray-400 font-serif italic">
                                            {product.category?.name || 'Exclusive'}
                                        </p>
                                        <p className="text-sm font-medium text-text-main-light">
                                            R {Number(product.basePrice).toLocaleString()}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mt-16">
                            <Link href="/women" className="inline-block border-b border-black pb-1 text-sm uppercase tracking-widest font-medium hover:text-primary hover:border-primary transition-colors">
                                Shop Women
                            </Link>
                            <Link href="/men" className="inline-block border-b border-black pb-1 text-sm uppercase tracking-widest font-medium hover:text-primary hover:border-primary transition-colors">
                                Shop Men
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Statement Feature */}
                <section className="relative h-[600px] md:h-[800px] w-full overflow-hidden">
                    <Image
                        src="/uploads/dükkanai.png"
                        alt="Stylish Shoppers at Socrati"
                        fill
                        className="object-cover fixed-bg"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-center p-8">
                        <div className="max-w-2xl bg-white/10 backdrop-blur-md p-12 border border-white/20">
                            <h3 className="text-white text-4xl md:text-6xl font-serif mb-8 leading-tight">
                                "Elegance is not standing out, but being remembered."
                            </h3>
                            <Link href="/about" className="inline-block bg-white text-black px-10 py-3 uppercase text-xs font-bold tracking-widest hover:bg-black hover:text-white transition-all">
                                Our Story
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
