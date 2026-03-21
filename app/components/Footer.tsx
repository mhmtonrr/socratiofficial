'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-surface-light pt-20 pb-10 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="lg:col-span-1">
                        <h4 className="text-lg font-serif mb-6 text-text-main-light">
                            Stay up to date!
                        </h4>
                        <form className="flex flex-col gap-4">
                            <div className="relative">
                                <input
                                    className="w-full bg-transparent border border-gray-400 px-4 py-3 text-sm focus:outline-none focus:border-primary text-text-main-light placeholder-text-muted-light rounded-none"
                                    placeholder="E-mail address*"
                                    type="email"
                                />
                                <button
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-bold uppercase text-text-main-light hover:text-primary"
                                    type="button"
                                >
                                    Submit
                                </button>
                            </div>
                            <div className="flex items-start gap-2">
                                <input
                                    className="mt-1 border-gray-300 text-primary focus:ring-primary rounded-sm bg-transparent"
                                    id="consent"
                                    type="checkbox"
                                />
                                <label className="text-xs text-text-muted-light leading-relaxed" htmlFor="consent">
                                    I have read the Privacy Policy and I agree to receive the newsletter.
                                </label>
                            </div>
                        </form>
                    </div>
                    <div>
                        <h5 className="text-xs font-bold uppercase tracking-widest mb-6 text-text-main-light">
                            Customer Care
                        </h5>
                        <ul className="space-y-3 text-sm text-text-muted-light">
                            <li><Link className="hover:text-primary transition-colors" href="/contact">Contact Us</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="/shipments-returns">Shipments & Returns</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="/size-guide">Size Guide</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="/faq">FAQ</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-xs font-bold uppercase tracking-widest mb-6 text-text-main-light">
                            The Company
                        </h5>
                        <ul className="space-y-3 text-sm text-text-muted-light">
                            <li><Link className="hover:text-primary transition-colors" href="/about">About Socrati</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="/boutiques">Boutiques</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-xs font-bold uppercase tracking-widest mb-6 text-text-main-light">
                            Follow Us
                        </h5>
                        <ul className="space-y-3 text-sm text-text-muted-light">
                            <li><Link className="hover:text-primary transition-colors flex items-center gap-2" href="https://www.instagram.com/socrati_official/" target="_blank" rel="noopener noreferrer">Instagram</Link></li>
                            <li><Link className="hover:text-primary transition-colors flex items-center gap-2" href="https://www.facebook.com/profile.php?id=61582951199606" target="_blank" rel="noopener noreferrer">Facebook</Link></li>
                            <li><Link className="hover:text-primary transition-colors flex items-center gap-2" href="#">Pinterest</Link></li>
                            <li><Link className="hover:text-primary transition-colors flex items-center gap-2" href="#">TikTok</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-200 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-text-muted-light">
                    <p>© 2026 Socrati - All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link className="hover:text-primary" href="/legal">Legal Notes</Link>
                        <Link className="hover:text-primary" href="/privacy">Privacy Policy</Link>
                        <Link className="hover:text-primary" href="/cookie-policy">Cookie Policy</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}
