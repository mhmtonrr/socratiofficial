'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, RefreshCw } from 'lucide-react';

declare global {
    interface Window {
        Checkout: {
            initiate: (opts: Record<string, unknown>) => {
                render: (container: string | HTMLElement) => void;
                unmount: () => void;
            };
        };
    }
}

interface PeachCheckoutProps {
    checkoutId: string;
    orderNumber: string;
    total: number;
    /** Called when the user cancels — lets parent re-show the form */
    onCancel?: () => void;
}

export default function PeachCheckout({
    checkoutId,
    orderNumber,
    total,
    onCancel,
}: PeachCheckoutProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const checkoutRef = useRef<{ render: (c: string | HTMLElement) => void; unmount: () => void } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const router = useRouter();

    const entityId = process.env.NEXT_PUBLIC_PEACH_ENTITY_ID ?? '';
    const sdkUrl = process.env.NODE_ENV === 'production'
        ? 'https://checkout.peachpayments.com/js/checkout.js'
        : 'https://sandbox-checkout.peachpayments.com/js/checkout.js';

    // Load the Peach SDK script once
    useEffect(() => {
        if (window.Checkout) {
            setSdkLoaded(true);
            return;
        }

        const existing = document.getElementById('peach-sdk-script');
        if (existing) {
            existing.addEventListener('load', () => setSdkLoaded(true));
            return;
        }

        const script = document.createElement('script');
        script.id = 'peach-sdk-script';
        script.src = sdkUrl;
        script.async = true;
        script.onload = () => setSdkLoaded(true);
        script.onerror = () => setError('Failed to load Peach Payments SDK. Please refresh.');
        document.head.appendChild(script);
    }, [sdkUrl]);

    // Once SDK is loaded and we have a checkoutId, initiate
    useEffect(() => {
        if (!sdkLoaded || !checkoutId || !containerRef.current) return;
        if (!window.Checkout) {
            setError('Peach Payments SDK not available. Please refresh.');
            return;
        }

        try {
            const checkout = window.Checkout.initiate({
                key: entityId,
                checkoutId,
                customisations: {
                    showCancelButton: true,
                    showAmountField: true,
                    theme: {
                        brand: { primary: '#8B7355' }, // match site primary colour
                        cards: {
                            background: '#FAFAF9',
                            backgroundHover: '#F5F3F1',
                        },
                    },
                    card: {
                        submitButtonText: 'Pay Now',
                        showBillingFields: false,
                    },
                },
                eventHandlers: {
                    onCompleted: () => {
                        router.push(`/order-success?orderNumber=${encodeURIComponent(orderNumber)}`);
                    },
                    onCancelled: () => {
                        onCancel?.();
                    },
                    onExpired: () => {
                        setError('Your checkout session has expired. Please try again.');
                        onCancel?.();
                    },
                    onError: () => {
                        setError('Payment failed. Please try a different card or payment method.');
                    },
                },
            });

            checkout.render(containerRef.current);
            checkoutRef.current = checkout;
        } catch (err) {
            console.error('Peach initiate error:', err);
            setError('Could not launch checkout. Please try again.');
        }

        return () => {
            try {
                checkoutRef.current?.unmount();
            } catch {
                // ignore unmount errors
            }
        };
    }, [sdkLoaded, checkoutId, entityId, orderNumber, router, onCancel]);

    if (error) {
        return (
            <div className="border border-rose-200 bg-rose-50 p-6 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm font-bold text-rose-700 mb-1">Payment Error</p>
                    <p className="text-xs text-rose-600">{error}</p>
                    <button
                        onClick={() => { setError(null); onCancel?.(); }}
                        className="mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-rose-700 hover:text-rose-900 transition-colors"
                    >
                        <RefreshCw className="w-3 h-3" /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            {/* Summary banner */}
            <div className="flex justify-between items-center px-1 mb-4">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    Secure payment via Peach Payments
                </span>
                <span className="text-sm font-bold text-text-main-light">
                    R {total.toLocaleString()}
                </span>
            </div>

            {/* The embedded checkout renders here */}
            <div
                ref={containerRef}
                id="peach-payment-form"
                style={{ minHeight: '360px' }}
                className="w-full"
            />

            {!sdkLoaded && (
                <div className="flex items-center justify-center py-16 text-[10px] uppercase tracking-widest text-gray-400">
                    <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading payment form...
                </div>
            )}
        </div>
    );
}
