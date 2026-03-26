'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Truck, ShieldCheck, RefreshCcw } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
    const { cartItems, removeItem, updateQuantity, cartTotal, cartCount, couponCode, discountAmount, applyCoupon, removeCoupon } = useCart();
    
    // Coupon state local
    const [couponInput, setCouponInput] = useState('');
    const [couponError, setCouponError] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    const shipping = cartTotal > 5000 ? 0 : 250; // Free shipping over R 5,000
    // Prevent negative total if discount is somehow larger
    const total = Math.max(0, cartTotal - discountAmount) + shipping;

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        setCouponError('');
        setIsApplying(true);

        try {
            const res = await fetch('/api/cart/apply-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponInput.trim(), cartTotal }),
            });
            const data = await res.json();
            
            if (!res.ok) {
                setCouponError(data.error || 'Invalid coupon codes');
            } else {
                applyCoupon(data.coupon.code, data.discountAmount);
                setCouponInput('');
            }
        } catch (error) {
            setCouponError('An unexpected error occurred');
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#FBFAF9]">
            <Header />

            <main className="flex-grow py-16 md:py-24">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-serif text-text-main-light mb-4 tracking-tight">Your Shopping Bag</h1>
                            <div className="flex items-center gap-3 text-sm text-gray-500 font-light">
                                <span>{cartCount} {cartCount === 1 ? 'Product' : 'Products'}</span>
                                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                <span>Complimentary Shipping over R 5,000</span>
                            </div>
                        </div>
                        {cartCount > 0 && (
                            <Link href="/women" className="text-[11px] uppercase tracking-widest text-primary font-bold underline underline-offset-8 hover:text-text-main-light transition-colors">
                                Continue Shopping
                            </Link>
                        )}
                    </div>

                    {cartItems.length === 0 ? (
                        <div className="bg-white border border-gray-100 py-32 px-8 text-center shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                <ShoppingBag className="w-8 h-8 text-gray-300" />
                            </div>
                            <h2 className="text-2xl font-serif text-text-main-light mb-4">Your bag is currently empty</h2>
                            <p className="text-gray-500 font-light mb-10 max-w-md mx-auto leading-relaxed text-sm">Discover our latest collections and find the perfect pieces to add to your wardrobe.</p>
                            <Link
                                className="inline-block bg-text-main-light text-white px-12 py-5 uppercase text-[11px] tracking-[0.2em] font-bold hover:bg-primary transition-all duration-500 shadow-md"
                                href="/women"
                            >
                                Explorer Collections
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                            {/* Items List */}
                            <div className="lg:col-span-8 space-y-8">
                                <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                    <div className="col-span-6">Product Details</div>
                                    <div className="col-span-2 text-center">Quantity</div>
                                    <div className="col-span-2 text-right">Unit Price</div>
                                    <div className="col-span-2 text-right">Total</div>
                                </div>
                                {cartItems.map(item => (
                                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-8 border-b border-gray-50 group">
                                        <div className="md:col-span-6 flex gap-6">
                                            <div className="relative w-24 h-30 md:w-32 md:h-40 flex-shrink-0 bg-[#F9F9F9] overflow-hidden shadow-sm">
                                                <Link href={`/product/${item.name}`}>
                                                    <Image
                                                        alt={item.name}
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                        src={item.image}
                                                        fill
                                                    />
                                                </Link>
                                            </div>
                                            <div className="flex flex-col justify-between py-1">
                                                <div>
                                                    <Link href={`/product/${item.name}`} className="hover:text-primary transition-colors inline-block">
                                                        <h3 className="text-lg font-serif text-text-main-light mb-2">{item.name}</h3>
                                                    </Link>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-500">Color: <span className="text-text-main-light font-medium">{item.color}</span></p>
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-500">Size: <span className="text-text-main-light font-medium">{item.size}</span></p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 w-fit mt-4"
                                                >
                                                    <X className="w-3 h-3" /> Remove Item
                                                </button>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 flex items-center justify-center">
                                            <div className="flex items-center border border-gray-200 bg-white">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="p-3 hover:bg-gray-50 transition-colors"
                                                >
                                                    <Minus className="w-3 h-3 text-gray-400" />
                                                </button>
                                                <span className="w-10 text-center text-xs font-bold text-text-main-light">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="p-3 hover:bg-gray-50 transition-colors"
                                                >
                                                    <Plus className="w-3 h-3 text-gray-400" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 flex items-center justify-end text-sm text-gray-400 font-light">
                                            R {item.price.toLocaleString()}
                                        </div>

                                        <div className="md:col-span-2 flex items-center justify-end text-base font-medium text-text-main-light">
                                            R {(item.price * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                ))}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                                    <div className="flex items-start gap-4 p-6 bg-white border border-gray-50 shadow-sm">
                                        <Truck className="w-6 h-6 text-primary flex-shrink-0" />
                                        <div>
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1">Free Delivery</h4>
                                            <p className="text-xs text-gray-400 font-light">On orders over R 5,000. Expected in 2-4 days.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-6 bg-white border border-gray-50 shadow-sm">
                                        <RefreshCcw className="w-6 h-6 text-primary flex-shrink-0" />
                                        <div>
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1">Free Returns</h4>
                                            <p className="text-xs text-gray-400 font-light">Within 14 days of purchase for all items.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-6 bg-white border border-gray-50 shadow-sm">
                                        <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0" />
                                        <div>
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1">2 Year Warranty</h4>
                                            <p className="text-xs text-gray-400 font-light">Certified authentication and artisanal care.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Summary */}
                            <div className="lg:col-span-4 lg:sticky lg:top-32">
                                <div className="bg-white border border-gray-100 p-8 shadow-xl">
                                    <h2 className="text-2xl font-serif text-text-main-light mb-8 pb-4 border-b border-gray-50">Summary</h2>
                                    <div className="space-y-6 mb-8">
                                        <div className="flex justify-between text-xs uppercase tracking-widest text-gray-500">
                                            <span>Subtotal</span>
                                            <span className="text-text-main-light font-bold">R {cartTotal.toLocaleString()}</span>
                                        </div>
                                        {couponCode && (
                                            <div className="flex justify-between text-xs uppercase tracking-widest text-emerald-600">
                                                <span className="flex items-center gap-2">
                                                    Discount ({couponCode})
                                                    <button onClick={removeCoupon} className="text-rose-500 hover:text-rose-700 ml-1" title="Remove coupon">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                                <span className="font-bold">-R {discountAmount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-xs uppercase tracking-widest text-gray-500">
                                            <span>Shipping</span>
                                            <span className="text-text-main-light font-bold">
                                                {shipping === 0 ? 'Complimentary' : `R ${shipping.toLocaleString()}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs uppercase tracking-widest text-gray-500">
                                            <span>Est. Taxes</span>
                                            <span className="text-text-main-light font-bold">R 0</span>
                                        </div>
                                        <div className="pt-6 border-t border-gray-100">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-lg font-serif text-text-main-light">Order Total</span>
                                                <span className="text-3xl font-serif text-text-main-light">R {total.toLocaleString()}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4">Currency: ZAR (R)</p>
                                        </div>
                                        
                                        {/* Coupon Input */}
                                        {!couponCode && (
                                            <div className="pt-6 border-t border-gray-100 flex items-start gap-2">
                                                <div className="flex-grow">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Voucher/Promo Code" 
                                                        value={couponInput}
                                                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                                        className="w-full border border-gray-300 px-3 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-text-main-light"
                                                    />
                                                    {couponError && <p className="text-rose-500 text-[10px] mt-1 uppercase tracking-widest italic">{couponError}</p>}
                                                </div>
                                                <button 
                                                    onClick={handleApplyCoupon}
                                                    disabled={isApplying || !couponInput.trim()}
                                                    className="bg-gray-100 text-text-main-light px-4 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                                                >
                                                    {isApplying ? '...' : 'Apply'}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        className="w-full bg-text-main-light text-white py-6 uppercase text-[11px] tracking-[0.2em] font-bold hover:bg-primary transition-all duration-500 flex items-center justify-center gap-3 mb-4 shadow-lg active:scale-95"
                                        href="/payment"
                                    >
                                        Secure Checkout <ArrowRight className="w-4 h-4" />
                                    </Link>

                                    <p className="text-[9px] text-center text-gray-400 uppercase tracking-widest leading-relaxed">
                                        By clicking checkout, you agree to our <br />
                                        <span className="underline cursor-pointer">Terms & Conditions</span>
                                    </p>

                                    <div className="mt-10 flex justify-center gap-6 opacity-40">
                                        <Image src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" width={40} height={20} className="grayscale hover:grayscale-0 transition-all" />
                                        <Image src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" width={40} height={20} className="grayscale hover:grayscale-0 transition-all" />
                                        <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" width={40} height={20} className="grayscale hover:grayscale-0 transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
