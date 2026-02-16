'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';
import { RefreshCcw, Home, AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />

            <main className="flex-grow flex items-center justify-center py-20 relative overflow-hidden">
                {/* Abstract luxury texture background */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
                    <div className="mb-12 inline-flex items-center justify-center w-28 h-28 rounded-full bg-rose-50 border border-rose-100 mb-8 animate-pulse">
                        <AlertTriangle className="w-10 h-10 text-rose-300" />
                    </div>

                    <h2 className="text-sm font-black uppercase tracking-[0.5em] text-rose-500 mb-6">
                        Refinement Overdue
                    </h2>

                    <h1 className="text-4xl md:text-6xl font-serif text-text-main-light mb-8 tracking-tight">
                        Unexpected <span className="italic">Interruption</span>
                    </h1>

                    <p className="text-gray-500 text-lg leading-relaxed mb-12 font-light max-w-md mx-auto">
                        Something went wrong with this experience. Our artisans have been notified. Please try refreshing the page.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button
                            onClick={() => reset()}
                            className="group bg-text-main-light text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-primary transition-all duration-500 shadow-xl shadow-gray-200 flex items-center gap-3 w-full sm:w-auto justify-center"
                        >
                            <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                            Restore Experience
                        </button>

                        <Link
                            href="/"
                            className="group border-2 border-gray-100 text-text-main-light px-10 py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all duration-500 flex items-center gap-3 w-full sm:w-auto justify-center"
                        >
                            <Home className="w-4 h-4" />
                            Back Home
                        </Link>
                    </div>

                    <div className="mt-16 bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Technical Reference</p>
                        <p className="text-[9px] font-mono text-gray-400 break-all opacity-60">
                            {error.digest || 'Internal system error signature: 0x88SOCRATI'}
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
