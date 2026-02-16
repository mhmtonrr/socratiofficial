'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get('orderNumber');

    return (
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
            <div className="mb-10 flex justify-center">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center animate-in zoom-in duration-700">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif text-text-main-light mb-6 tracking-tight">Thank You for Your Order</h1>
            <p className="text-lg text-gray-500 font-light mb-12 leading-relaxed">
                Your order <span className="font-bold text-text-main-light">#{orderNumber}</span> has been successfully placed.
                We've sent a confirmation email to your inbox with all details.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                <div className="bg-surface-light p-8 border border-gray-100 flex flex-col items-center text-center space-y-3">
                    <Package className="w-6 h-6 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Order Processing</h3>
                    <p className="text-xs text-gray-400 font-light leading-relaxed">Your artisan pieces are now being carefully prepared and packaged for shipment.</p>
                </div>
                <div className="bg-surface-light p-8 border border-gray-100 flex flex-col items-center text-center space-y-3">
                    <Mail className="w-6 h-6 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Confirmation Sent</h3>
                    <p className="text-xs text-gray-400 font-light leading-relaxed">A detailed invoice and tracking information have been sent to your email.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                    href="/"
                    className="bg-text-main-light text-white px-10 py-5 uppercase text-[11px] tracking-[0.2em] font-bold hover:bg-primary transition-all duration-500 shadow-lg min-w-[200px]"
                >
                    Back to Home
                </Link>
                <Link
                    href="/women"
                    className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] font-bold text-text-main-light border-b border-text-main-light pb-2 hover:text-primary hover:border-primary transition-all"
                >
                    Continue Shopping <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main>
                <Suspense fallback={<div className="py-40 text-center uppercase tracking-widest text-[10px]">Loading confirmation...</div>}>
                    <SuccessContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
