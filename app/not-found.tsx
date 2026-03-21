'use client';

import Link from 'next/link';
import Image from 'next/image';
import Header from './components/Header';
import Footer from './components/Footer';
import { ChevronRight, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />

            <main className="flex-grow flex items-center justify-center relative overflow-hidden py-20">
                {/* Background Decoration */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none flex items-center justify-center">
                    <h1 className="text-[30vw] font-serif font-black leading-none">404</h1>
                </div>

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <div className="mb-12 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-50 border border-gray-100 mb-8 animate-in fade-in zoom-in duration-700">
                        <Search className="w-8 h-8 text-primary/40" />
                    </div>

                    <h2 className="text-sm font-black uppercase tracking-[0.4em] text-primary mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        Page Not Found
                    </h2>

                    <h1 className="text-5xl md:text-7xl font-serif text-text-main-light mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        Lost in <span className="italic">Elegance</span>
                    </h1>

                    <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed mb-12 font-light animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                        The piece you are looking for has been moved or curated elsewhere. Let us guide you back to our latest collections.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <Link
                            href="/"
                            className="group bg-text-main-light text-white px-12 py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-primary transition-all duration-500 shadow-xl shadow-gray-200 flex items-center gap-3"
                        >
                            Back to Boutique <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href="/women"
                            className="text-xs font-black uppercase tracking-[0.2em] text-text-main-light hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary py-2"
                        >
                            Shop Women's
                        </Link>

                        <Link
                            href="/men"
                            className="text-xs font-black uppercase tracking-[0.2em] text-text-main-light hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary py-2"
                        >
                            Shop Men's
                        </Link>
                    </div>

                    {/* Quick Links Section */}
                    <div className="mt-24 pt-12 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-0 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Our World</p>
                            <ul className="space-y-2">
                                <li><Link href="/about" className="text-xs text-gray-600 hover:text-primary transition-colors">About Us</Link></li>
                                <li><Link href="/boutiques" className="text-xs text-gray-600 hover:text-primary transition-colors">Boutiques</Link></li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Support</p>
                            <ul className="space-y-2">
                                <li><Link href="/contact" className="text-xs text-gray-600 hover:text-primary transition-colors">Contact</Link></li>
                                <li><Link href="/faq" className="text-xs text-gray-600 hover:text-primary transition-colors">FAQ</Link></li>
                            </ul>
                        </div>
                        <div className="col-span-2">
                            <div className="bg-gray-50 p-6 rounded-3xl text-left border border-gray-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 italic">Luxury Concierge</p>
                                <p className="text-xs text-gray-500 leading-relaxed">Need assistance finding a specific item? Our specialists are here to help.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
