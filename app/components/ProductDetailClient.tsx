'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ZoomIn, ChevronRight, ChevronLeft, ShieldCheck, Truck, RefreshCcw, Check, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import HappyPayWidget from './HappyPayWidget';

// DB'den gelen tiplere benzer bir interface (Prisma client'ı client-side'da import edemeyiz, o yüzden manuel tanımlıyorum veya any kullanıyorum şimdilik)
interface ProductProps {
    product: any;
    similarProducts?: any[];
}

export default function ProductDetailClient({ product, similarProducts = [] }: ProductProps) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Varyantlardan renkleri ve bedenleri çıkaralım
    const variants = product.variants || [];
    const images = product.images || [];

    // Benzersiz renkleri bul
    const uniqueColors = Array.from(new Map(variants.map((v: any) => [v.color, { name: v.color, hex: v.colorHex, label: v.color }])).values()) as { name: string, hex: string, label: string }[];

    // Benzersiz bedenleri bul
    const uniqueSizes = Array.from(new Set(variants.map((v: any) => v.size))).sort() as string[];

    // Default states
    const [selectedColor, setSelectedColor] = useState<string | undefined>(uniqueColors[0]?.name);
    const [selectedSize, setSelectedSize] = useState<string | undefined>(uniqueSizes[0]);
    const [quantity, setQuantity] = useState(1);

    // Ana görseli yönet (isMain olan veya ilk görsel)
    const defaultImage = images.find((img: any) => img.isMain)?.url || images[0]?.url;
    const [mainImage, setMainImage] = useState(defaultImage);

    const handleNextImage = () => {
        const currentIndex = images.findIndex((img: any) => img.url === mainImage);
        const nextIndex = (currentIndex + 1) % images.length;
        setMainImage(images[nextIndex].url);
    };

    const handlePrevImage = () => {
        const currentIndex = images.findIndex((img: any) => img.url === mainImage);
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        setMainImage(images[prevIndex].url);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isLightboxOpen) {
                if (e.key === 'ArrowRight') handleNextImage();
                if (e.key === 'ArrowLeft') handlePrevImage();
                if (e.key === 'Escape') setIsLightboxOpen(false);
            } else {
                // Always allow keyboard nav if lightbox is closed
                if (e.key === 'ArrowRight') handleNextImage();
                if (e.key === 'ArrowLeft') handlePrevImage();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mainImage, isLightboxOpen]);

    const handleAddToCart = () => {
        const variant = variants.find((v: any) => v.color === selectedColor && v.size === selectedSize);
        if (!variant) return;

        addItem({
            id: `${product.id}-${variant.id}`,
            variantId: variant.id,
            productId: product.id,
            name: product.name,
            color: selectedColor!,
            size: selectedSize!,
            price: Number(variant.price || product.basePrice),
            quantity: quantity,
            image: mainImage || defaultImage
        });

        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (!product) return <div>Loading...</div>;

    return (
        <>
            <Header />

            <main className="bg-white min-h-screen">
                <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-8">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-10">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>

                        {/* Level 1: Gender (Grandparent or Parent) */}
                        {product.category?.parent?.parent ? (
                            <>
                                <ChevronRight className="w-3 h-3" />
                                <Link href={`/${product.category.parent.parent.slug}`} className="hover:text-primary transition-colors">
                                    {product.category.parent.parent.name}
                                </Link>
                            </>
                        ) : product.category?.parent ? (
                            <>
                                <ChevronRight className="w-3 h-3" />
                                <Link href={`/${product.category.parent.slug}`} className="hover:text-primary transition-colors">
                                    {product.category.parent.name}
                                </Link>
                            </>
                        ) : null}

                        {/* Direct Category (usually the Subcategory like 'Heels') */}
                        {product.category && (
                            <>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-gray-400">
                                    {product.category.name}
                                </span>
                            </>
                        )}

                        <ChevronRight className="w-3 h-3" />
                        <span className="text-text-main-light font-semibold">{product.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                        {/* Image Section */}
                        <div className="lg:col-span-7 flex flex-col gap-4">
                            {/* Wrap image + arrows in a relative container so arrows can escape overflow-hidden */}
                            <div className="relative">
                                <div
                                    className="relative aspect-square bg-transparent overflow-hidden group cursor-pointer"
                                    onClick={() => setIsLightboxOpen(true)}
                                >
                                    {mainImage && (
                                        <Image
                                            alt={product.name}
                                            className="object-contain transition-transform duration-700 group-hover:scale-105"
                                            src={mainImage}
                                            fill
                                            priority
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    )}
                                </div>

                                {/* Navigation Arrows — outside overflow-hidden so z-index works globally */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-md hover:bg-white text-black p-4 rounded-full transition-all shadow-xl border border-gray-100 group/nav"
                                            aria-label="Previous image"
                                        >
                                            <ChevronLeft className="w-6 h-6 group-hover/nav:scale-110 transition-transform" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-md hover:bg-white text-black p-4 rounded-full transition-all shadow-xl border border-gray-100 group/nav"
                                            aria-label="Next image"
                                        >
                                            <ChevronRight className="w-6 h-6 group-hover/nav:scale-110 transition-transform" />
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                {images.map((img: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(img.url)}
                                        className={`relative aspect-square bg-transparent overflow-hidden transition-all duration-300 border-b-2 ${mainImage === img.url ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <Image
                                            alt={`${product.name} view ${idx + 1}`}
                                            className="object-contain"
                                            src={img.url}
                                            fill
                                            sizes="(max-width: 768px) 25vw, 10vw"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="lg:col-span-5 flex flex-col">
                            <div className="border-b border-gray-100 pb-8 mb-8">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-2 block">{product.category?.name}</span>
                                        <h1 className="text-3xl md:text-4xl font-serif text-text-main-light mb-1 leading-tight">{product.name}</h1>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-2">
                                    <span className="text-2xl font-light text-text-main-light">R {Number(product.basePrice).toLocaleString()}</span>
                                </div>

                                {/* HappyPay BNPL widget */}
                                <div className="mb-4">
                                    <HappyPayWidget amount={Number(product.basePrice)} layout="peach" />
                                </div>

                                <p className="text-gray-500 text-sm leading-relaxed font-light italic">
                                    "{product.description}"
                                </p>
                            </div>

                            {/* Selection Section */}
                            <div className="space-y-8 mb-10">
                                {/* Color Selection */}
                                {uniqueColors.length > 0 && (
                                    <div>
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-text-main-light flex justify-between">
                                            Color: <span className="text-gray-400 font-normal">{selectedColor}</span>
                                        </h3>
                                        <div className="flex gap-4">
                                            {uniqueColors.map((color: any) => (
                                                <button
                                                    key={color.name}
                                                    onClick={() => setSelectedColor(color.name)}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${selectedColor === color.name ? 'border-primary ring-1 ring-primary ring-offset-4' : 'border-transparent hover:border-gray-200'
                                                        }`}
                                                >
                                                    <div className="w-full h-full rounded-full border border-white" style={{ backgroundColor: color.hex }} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Size Selection */}
                                {uniqueSizes.length > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-main-light">Select Size</h3>
                                            <button
                                                onClick={() => setIsSizeGuideOpen(true)}
                                                className="text-[10px] uppercase tracking-widest text-primary underline underline-offset-4"
                                            >
                                                Size Guide
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                            {uniqueSizes.map((size: any) => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`py-3 text-[11px] border transition-all duration-300 ${selectedSize === size
                                                        ? 'border-primary bg-primary text-white font-bold'
                                                        : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity */}
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center border border-gray-200 h-12">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-full hover:bg-gray-50 transition-colors"
                                        >−</button>
                                        <span className="w-12 text-center text-sm">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-10 h-full hover:bg-gray-50 transition-colors"
                                        >+</button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">In Stock</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 mb-12">
                                <button
                                    onClick={handleAddToCart}
                                    className={`w-full py-5 uppercase text-[11px] tracking-[0.2em] font-bold transition-all duration-500 flex items-center justify-center gap-3 ${added ? 'bg-green-600 text-white' : 'bg-text-main-light text-white hover:bg-primary'
                                        }`}
                                >
                                    {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                                    {added ? 'Added to Bag' : 'Add to Shopping Bag'}
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-4 py-8 border-y border-gray-100 mb-10">
                                <div className="flex flex-col items-center text-center gap-2">
                                    <Truck className="w-5 h-5 text-gray-400" />
                                    <span className="text-[9px] uppercase tracking-widest text-gray-500">Free Shipping</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <RefreshCcw className="w-5 h-5 text-gray-400" />
                                    <span className="text-[9px] uppercase tracking-widest text-gray-500">Free Returns</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-gray-400" />
                                    <span className="text-[9px] uppercase tracking-widest text-gray-500">2 Year Warranty</span>
                                </div>
                            </div>

                            {/* Accordion Details */}
                            <div className="space-y-4">
                                <details className="group" open>
                                    <summary className="flex justify-between items-center cursor-pointer py-3 border-b border-gray-100 uppercase text-[10px] tracking-[0.2em] font-bold text-text-main-light">
                                        Product Specifications
                                        <span className="transition-transform group-open:rotate-180">▼</span>
                                    </summary>
                                    <ul className="mt-4 space-y-2 pb-4">
                                        {/* product.details is array of strings */}
                                        {product.details && product.details.map((detail: string, i: number) => (
                                            <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
                                                <span className="w-1 h-1 bg-primary rounded-full"></span>
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                                <details className="group">
                                    <summary className="flex justify-between items-center cursor-pointer py-3 border-b border-gray-100 uppercase text-[10px] tracking-[0.2em] font-bold text-text-main-light">
                                        Care Instructions
                                        <span className="transition-transform group-open:rotate-180">▼</span>
                                    </summary>
                                    <div className="mt-4 pb-4">
                                        <p className="text-xs text-gray-500 leading-relaxed font-light">
                                            {product.care}
                                        </p>
                                    </div>
                                </details>
                            </div>
                        </div>
                    </div>
                </div>

                {/* You Might Also Like */}
                {similarProducts.length > 0 && (
                    <section className="bg-surface-light py-24 px-4 md:px-12 border-t border-gray-100">
                        <div className="max-w-[1440px] mx-auto">
                            <h2 className="text-3xl font-serif text-text-main-light mb-12 text-center uppercase tracking-widest">You Might Also Like</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                {similarProducts.map((p: any) => (
                                    <Link key={p.id} href={`/product/${p.id}`} className="group">
                                        <div className="aspect-square bg-transparent overflow-hidden relative mb-4">
                                            {p.images?.[0] && (
                                                <Image
                                                    alt={p.name}
                                                    src={p.images[0].url}
                                                    fill
                                                    className="object-contain transition-transform duration-700 group-hover:scale-110"
                                                    sizes="(max-width: 768px) 50vw, 25vw"
                                                />
                                            )}
                                        </div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-text-main-light">{p.name}</h3>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{p.category?.name}</p>
                                        <p className="text-sm font-light mt-2 text-primary">R {Number(p.basePrice).toLocaleString()}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Size Guide Modal */}
                {isSizeGuideOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsSizeGuideOpen(false)}
                        />
                        <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 md:p-12 animate-in fade-in zoom-in duration-300">
                            <button
                                onClick={() => setIsSizeGuideOpen(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <h2 className="text-3xl font-serif text-text-main-light mb-8">Size Guide</h2>

                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Footwear Conversion</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="py-3 pr-4">EU</th>
                                                    <th className="py-3 px-4">UK</th>
                                                    <th className="py-3 px-4">US</th>
                                                    <th className="py-3 pl-4">CM</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-gray-500">
                                                {[
                                                    ['36', '3', '5', '22.5'],
                                                    ['37', '4', '6', '23.2'],
                                                    ['38', '5', '7', '24.0'],
                                                    ['39', '6', '8', '24.7'],
                                                    ['40', '7', '9', '25.5'],
                                                    ['41', '8', '10', '26.2'],
                                                    ['42', '9', '11', '27.0']
                                                ].map((row, i) => (
                                                    <tr key={i} className="border-b border-gray-50">
                                                        <td className="py-3 pr-4 font-bold text-text-main-light">{row[0]}</td>
                                                        <td className="py-3 px-4">{row[1]}</td>
                                                        <td className="py-3 px-4">{row[2]}</td>
                                                        <td className="py-3 pl-4">{row[3]}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-main-light">Artistal Fit Advice</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed italic">
                                        "Our leather products are designed to mold gently to your feet. If you are between sizes, we recommend selecting the larger size for the ultimate Socrati experience."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <Footer />
            </main>

            {/* Lightbox / Full Screen Modal */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[200] flex flex-col bg-black animate-in fade-in duration-300 overflow-hidden">
                    {/* Top Bar */}
                    <div className="absolute top-0 inset-x-0 z-[210] flex justify-between items-center p-4 md:p-8 bg-gradient-to-b from-black/60 to-transparent">
                        <div className="text-white/80">
                            <h3 className="text-lg md:text-2xl font-serif">{product.name}</h3>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
                                {images.findIndex((img: any) => img.url === mainImage) + 1} / {images.length}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="p-3 text-white hover:rotate-90 transition-all duration-300 bg-white/10 rounded-full backdrop-blur-md"
                        >
                            <X className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                    </div>

                    <div className="flex-grow relative w-full h-full flex flex-col items-center justify-center p-4 md:p-20">
                        {/* Center Stage Image */}
                        <div className="relative w-full h-[60vh] md:h-full group/main max-w-5xl">
                            {mainImage && (
                                <Image
                                    alt="Cinematic View"
                                    src={mainImage}
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            )}

                            {/* Modal Arrows - Optimized for all screens */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                                        className="absolute left-0 md:-left-20 top-1/2 -translate-y-1/2 z-[220] bg-white/10 md:bg-white/5 hover:bg-white hover:text-black text-white p-3 md:p-5 rounded-full transition-all backdrop-blur-sm"
                                    >
                                        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                                        className="absolute right-0 md:-right-20 top-1/2 -translate-y-1/2 z-[220] bg-white/10 md:bg-white/5 hover:bg-white hover:text-black text-white p-3 md:p-5 rounded-full transition-all backdrop-blur-sm"
                                    >
                                        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bottom Info & Thumbnails */}
                    <div className="w-full bg-black/40 backdrop-blur-xl border-t border-white/10 p-6 md:p-10">
                        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center gap-8">
                            {/* Thumbnails - Horizontal Scroll on Mobile, Grid on Desktop */}
                            <div className="flex md:flex-wrap gap-3 overflow-x-auto w-full md:w-auto pb-4 md:pb-0 no-scrollbar snap-x">
                                {images.map((img: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(img.url)}
                                        className={`flex-shrink-0 w-16 md:w-20 aspect-[4/5] relative overflow-hidden transition-all duration-500 border-2 snap-center ${mainImage === img.url ? 'border-primary' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                    >
                                        <Image src={img.url} alt="nav" fill className="object-cover" />
                                    </button>
                                ))}
                            </div>

                            <div className="hidden md:flex flex-col flex-grow text-white">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{product.category?.name}</span>
                                <h4 className="text-xl font-serif">{product.name}</h4>
                            </div>

                            <button
                                onClick={() => {
                                    handleAddToCart();
                                    setIsLightboxOpen(false);
                                }}
                                className="w-full md:w-auto px-12 py-4 bg-white text-black uppercase text-xs font-black tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl"
                            >
                                Add to Bag - R {Number(product.basePrice).toLocaleString()}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
