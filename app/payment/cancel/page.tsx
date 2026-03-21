'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { XCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CancelContent() {
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get('orderNumber');

    return (
        <div className="max-w-2xl mx-auto px-4 py-28 text-center">
            <div className="mb-10 flex justify-center">
                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                    <XCircle className="w-12 h-12 text-rose-400" />
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif text-text-main-light mb-6 tracking-tight">
                Payment Cancelled
            </h1>
            <p className="text-lg text-gray-500 font-light mb-4 leading-relaxed">
                Your payment was cancelled and no charges were made.
            </p>
            {orderNumber && (
                <p className="text-sm text-gray-400 mb-12">
                    Order reference <span className="font-bold text-text-main-light">#{orderNumber}</span> has been voided.
                </p>
            )}
            {!orderNumber && <div className="mb-12" />}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                    href="/cart"
                    className="flex items-center gap-3 bg-text-main-light text-white px-10 py-5 uppercase text-[11px] tracking-[0.2em] font-bold hover:bg-primary transition-all duration-500 shadow-lg"
                >
                    <ShoppingBag className="w-4 h-4" />
                    Back to Cart
                </Link>
                <Link
                    href="/payment"
                    className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] font-bold text-text-main-light border-b border-text-main-light pb-2 hover:text-primary hover:border-primary transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Try Again
                </Link>
            </div>
        </div>
    );
}

export default function PaymentCancelPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main>
                <Suspense fallback={<div className="py-40 text-center uppercase tracking-widest text-[10px]">Loading...</div>}>
                    <CancelContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
