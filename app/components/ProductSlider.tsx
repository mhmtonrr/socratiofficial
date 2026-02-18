'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductSliderProps {
    products: any[];
}

export default function ProductSlider({ products }: ProductSliderProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragMoved, setDragMoved] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollPos = useRef(0);
    const startX = useRef(0);
    const startScrollLeft = useRef(0);

    // Auto-scroll logic
    useEffect(() => {
        let animationFrameId: number;
        let lastTimestamp: number;

        const step = (timestamp: number) => {
            if (!lastTimestamp) lastTimestamp = timestamp;
            const deltaTime = timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            if (scrollRef.current && !isHovered && !isDragging) {
                const container = scrollRef.current;

                // Only scroll if content is wider than container
                if (container.scrollWidth > container.clientWidth) {
                    // Scroll speed: pixels per second
                    const speed = 40;
                    scrollPos.current += (speed * deltaTime) / 1000;

                    // Reset to beginning if reached the halfway point (since we duplicated items)
                    if (scrollPos.current >= container.scrollWidth / 2) {
                        scrollPos.current = 0;
                    }

                    container.scrollLeft = scrollPos.current;
                }
            } else if (scrollRef.current && (isHovered || isDragging)) {
                // Sync internal pos with manual scroll position when hovered or dragging
                scrollPos.current = scrollRef.current.scrollLeft;
            }
            animationFrameId = requestAnimationFrame(step);
        };

        animationFrameId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isHovered, isDragging, products.length]);

    // Mouse Drag Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setDragMoved(false);
        startX.current = e.pageX - scrollRef.current.offsetLeft;
        startScrollLeft.current = scrollRef.current.scrollLeft;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;

        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 2;

        if (Math.abs(walk) > 5) {
            setDragMoved(true);
        }

        scrollRef.current.scrollLeft = startScrollLeft.current - walk;
        scrollPos.current = scrollRef.current.scrollLeft;
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    const handleLinkClick = (e: React.MouseEvent) => {
        if (dragMoved) {
            e.preventDefault();
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 400;
            scrollRef.current.scrollTo({
                left: scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount),
                behavior: 'smooth'
            });
        }
    };

    if (!products || products.length === 0) return null;

    // Double items for seamless loop
    const displayProducts = [...products, ...products];

    return (
        <section
            className="bg-white py-24 overflow-hidden relative"
        >
            <div className="max-w-[2200px] mx-auto px-4 md:px-8">
                <div className="flex justify-between items-end mb-16 px-4 md:px-8">
                    <div className="text-left">
                        <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] block mb-4">New Arrivals</span>
                        <h3 className="text-4xl md:text-6xl font-serif text-text-main-light italic">The Latest Season</h3>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onClick={() => scroll('left')}
                            className="w-14 h-14 rounded-full border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-md bg-white/50 backdrop-blur-sm"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onClick={() => scroll('right')}
                            className="w-14 h-14 rounded-full border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-md bg-white/50 backdrop-blur-sm"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    className={`flex gap-8 md:gap-12 overflow-x-auto no-scrollbar pb-8 px-4 md:px-8 cursor-grab active:cursor-grabbing select-none transition-transform duration-150`}
                >
                    {displayProducts.map((product, idx) => (
                        <Link
                            key={`${product.id}-${idx}`}
                            href={`/product/${product.id}`}
                            onClick={handleLinkClick}
                            onDragStart={(e) => e.preventDefault()}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="flex-shrink-0 w-[280px] md:w-[380px] group"
                        >
                            <div className="aspect-square bg-gray-50 mb-6 overflow-hidden relative border border-gray-50/50 shadow-sm pointer-events-none">
                                {product.images?.[0] && (
                                    <Image
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                                        src={product.images.find((img: any) => img.isMain)?.url || product.images[0].url}
                                        fill
                                        draggable={false}
                                        sizes="(max-width: 768px) 280px, 380px"
                                        priority={idx < 5}
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-700" />
                            </div>
                            <div className="space-y-1.5 px-1 pointer-events-none">
                                <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">{product.category?.name}</p>
                                <h4 className="text-xl md:text-2xl font-serif text-text-main-light group-hover:text-primary transition-colors italic leading-tight">
                                    {product.name}
                                </h4>
                                <p className="text-base font-light text-gray-400">
                                    R {Number(product.basePrice).toLocaleString()}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
