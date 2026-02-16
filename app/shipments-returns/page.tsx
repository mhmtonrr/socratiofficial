
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Truck, RefreshCcw, ShieldCheck, Globe, Clock, Package } from 'lucide-react';

export default function ShipmentsReturnsPage() {
    return (
        <div className="bg-white min-h-screen">
            <Header />

            <header className="bg-surface-light py-16 md:py-24 border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif text-text-main-light mb-6 tracking-tight">Shipments & Returns</h1>
                    <p className="text-text-muted-light text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
                        Excellence in every step. We ensure your Socrati Official pieces reach you with the same care and attention they were crafted with.
                    </p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 gap-16">
                    {/* Shipping Section */}
                    <section id="shipping" className="space-y-12">
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                            <Truck className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-serif text-text-main-light">Shipping Policy</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm text-gray-500 font-light leading-relaxed">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-main-light mb-3">Complimentary Shipping</h3>
                                    <p>Socrati Official offers complimentary express shipping on all orders over R 5,000. For orders below this amount, a flat rate of R 250 applies worldwide.</p>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-main-light mb-3">Delivery Times</h3>
                                    <ul className="space-y-2">
                                        <li>• South Africa: 2-3 business days</li>
                                        <li>• Europe & North America: 3-5 business days</li>
                                        <li>• Rest of the World: 5-7 business days</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-main-light mb-3">Order Tracking</h3>
                                    <p>Once your order is dispatched, you will receive a confirmation email with a unique tracking number to follow your selection's journey.</p>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-main-light mb-3">Safe Delivery</h3>
                                    <p>All our shipments are insured against theft and accidental damage until they are delivered to your specified address.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Returns Section */}
                    <section id="returns" className="space-y-12 pt-16 border-t border-gray-100">
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                            <RefreshCcw className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-serif text-text-main-light">Returns & Exchanges</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm text-gray-500 font-light leading-relaxed">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-main-light mb-3">14-Day Return Window</h3>
                                    <p>You may return your items for a full refund or exchange within 14 days of receiving your order. Items must be in their original condition, unworn, and with all Socrati tags attached.</p>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-main-light mb-3">Return Process</h3>
                                    <p>To initiate a return, please log into your account or contact our customer care team. We will provide a pre-paid shipping label for your convenience.</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-main-light mb-3">Refunds</h3>
                                    <p>Once your return is received and inspected, the refund will be processed to your original payment method within 5-7 business days.</p>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-main-light mb-3">Exchange Policy</h3>
                                    <p>If you require a different size or color, we recommend placing a new order and returning the original item for an effortless transition.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Quality Promise */}
                    <section className="bg-surface-light p-8 md:p-12 text-center space-y-6">
                        <ShieldCheck className="w-10 h-10 text-primary mx-auto" />
                        <h3 className="text-xl font-serif text-text-main-light uppercase tracking-widest">Our Quality Commitment</h3>
                        <p className="text-sm text-gray-400 font-light max-w-2xl mx-auto italic">
                            "Every pair of Socrati Official shoes undergoes rigorous quality control before it leaves our atelier. If you find any artisanal defect, please reach out to us immediately for our master concierge service."
                        </p>
                    </section>

                    {/* FAQ Quick Links */}
                    <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-12">
                        <div className="flex flex-col items-center text-center gap-4">
                            <Globe className="w-6 h-6 text-gray-300" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-main-light">International Duties</h4>
                            <p className="text-[10px] text-gray-400">Taxes and duties are included in the final price for most regions.</p>
                        </div>
                        <div className="flex flex-col items-center text-center gap-4">
                            <Clock className="w-6 h-6 text-gray-300" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-main-light">Processing Time</h4>
                            <p className="text-[10px] text-gray-400">Orders placed before 2 PM CET are typically dispatched same day.</p>
                        </div>
                        <div className="flex flex-col items-center text-center gap-4">
                            <Package className="w-6 h-6 text-gray-300" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-main-light">Signature Required</h4>
                            <p className="text-[10px] text-gray-400">A signature is required upon delivery for all luxury goods.</p>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
