'use client';

import { useCart } from '../../context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, Minus, Plus, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

export default function CartDrawer() {
    const { cartItems, removeItem, updateQuantity, cartTotal, cartCount, isCartOpen, setIsCartOpen } = useCart();

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isCartOpen]);

    const shipping = cartTotal > 5000 ? 0 : 250;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-white z-[90] flex flex-col transition-transform duration-400 ease-out shadow-2xl ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-main-light">
                            Shopping Bag
                        </h2>
                        {cartCount > 0 && (
                            <span className="bg-primary text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close cart"
                    >
                        <X className="w-5 h-5 text-text-main-light" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-16">
                            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-gray-300" />
                            </div>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-widest text-text-main-light mb-2">Your bag is empty</p>
                                <p className="text-xs text-gray-400 font-light">Add pieces to your collection</p>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="border border-text-main-light text-text-main-light hover:bg-text-main-light hover:text-white px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-5 divide-y divide-gray-50">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-4 pt-5 first:pt-0 animate-in fade-in duration-300">
                                    {/* Image */}
                                    <div className="relative w-20 h-24 flex-shrink-0 bg-gray-50 overflow-hidden">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <h3 className="text-xs font-bold uppercase tracking-wide text-text-main-light truncate pr-2">
                                                {item.name}
                                            </h3>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-gray-300 hover:text-rose-400 transition-colors flex-shrink-0"
                                                aria-label="Remove item"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
                                            {item.color && item.color !== 'undefined' ? item.color : ''}
                                            {item.color && item.color !== 'undefined' && item.size ? ' · ' : ''}
                                            Size {item.size}
                                        </p>
                                        <p className="text-sm font-bold text-primary font-serif mt-2">
                                            R {(item.price * item.quantity).toLocaleString()}
                                        </p>

                                        {/* Quantity */}
                                        <div className="flex items-center gap-2 mt-3">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="w-6 h-6 border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="w-6 h-6 border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer with totals + CTA */}
                {cartItems.length > 0 && (
                    <div className="border-t border-gray-100 px-6 py-5 space-y-4 bg-white">
                        {/* Subtotal */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-text-muted-light">
                                <span>Subtotal</span>
                                <span>R {cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-text-muted-light">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'Free' : `R ${shipping.toLocaleString()}`}</span>
                            </div>
                            {cartTotal < 5000 && (
                                <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                                    Free shipping on orders over R 5,000
                                </p>
                            )}
                            <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
                                <span className="uppercase tracking-widest">Total</span>
                                <span className="font-serif text-base text-primary">R {(cartTotal + shipping).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Buttons */}
                        <Link
                            href="/payment"
                            onClick={() => setIsCartOpen(false)}
                            className="w-full bg-primary text-white py-4 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-[#7A6448] transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            Secure Checkout
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="w-full border border-gray-200 text-text-main-light py-3.5 text-[10px] uppercase tracking-[0.2em] font-bold hover:border-primary hover:text-primary transition-all duration-300"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
