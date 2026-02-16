'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, Search, Heart, ShoppingBag, User, LogOut, LayoutDashboard, X, ChevronRight, Instagram, Facebook } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
    const { data: session } = useSession();
    const { cartCount } = useCart();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isAdmin = (session?.user as any)?.role === 'ADMIN';

    // Disable body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    // Close mobile menu on pathname change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Handle real-time search with debouncing
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                try {
                    const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
                    const data = await response.json();
                    setSearchResults(data.products || []);
                } catch (error) {
                    console.error('Search failed:', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('q', searchQuery);
            const targetPath = (pathname === '/women' || pathname === '/men') ? pathname : '/women';
            router.push(`${targetPath}?${params.toString()}`);
            setIsSearchOpen(false);
        }
    };

    return (
        <div ref={searchRef} className="relative w-full z-50">
            {/* Mobile Menu Drawer */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 z-[60] lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />
            <div
                className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-[70] transition-transform duration-500 ease-out lg:hidden transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <span className="font-serif text-xl tracking-[0.2em] font-bold text-text-main-light">MENU</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 border border-gray-100 rounded-full">
                            <X className="w-5 h-5 text-text-main-light" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-8">
                        <nav className="flex flex-col space-y-8">
                            {[
                                { name: 'Women', href: '/women' },
                                { name: 'Men', href: '/men' },
                                { name: 'Bags', href: '/bags' },
                                { name: 'Accessories', href: '/accessories' },
                                { name: 'About Us', href: '/about' },
                                { name: 'Contact', href: '/contact' },
                            ].map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="flex justify-between items-center group"
                                >
                                    <span className="text-2xl font-serif text-text-main-light group-hover:text-primary transition-colors">{link.name}</span>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all" />
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-16 pt-8 border-t border-gray-100">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-6">Customer Service</h4>
                            <div className="space-y-4">
                                <Link href="/account" className="flex items-center gap-3 text-sm text-text-main-light">
                                    <User className="w-4 h-4" /> My Account
                                </Link>
                                <Link href="/cart" className="flex items-center gap-3 text-sm text-text-main-light">
                                    <ShoppingBag className="w-4 h-4" /> Shopping Bag ({cartCount})
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 flex justify-between items-center">
                        <div className="flex gap-4">
                            <Link href="https://www.instagram.com/socrati_official/" target="_blank" className="p-2 bg-white rounded-full shadow-sm">
                                <Instagram className="w-4 h-4 text-text-main-light" />
                            </Link>
                            <Link href="https://www.facebook.com/profile.php?id=61582951199606" target="_blank" className="p-2 bg-white rounded-full shadow-sm">
                                <Facebook className="w-4 h-4 text-text-main-light" />
                            </Link>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">© 2024 Socrati</span>
                    </div>
                </div>
            </div>

            <div className="bg-surface-light border-b border-gray-200 text-xs py-2 px-4 md:px-8 flex justify-between items-center">
                <div className="flex space-x-4">
                    <Link className="text-text-muted-light hover:text-primary transition-colors" href="tel:+27111234567">
                        Call Us
                    </Link>
                    <Link className="text-text-muted-light hover:text-primary transition-colors" href="/boutiques">
                        Boutiques
                    </Link>
                    {isAdmin && (
                        <Link className="text-primary font-bold hover:text-text-main-light transition-colors flex items-center gap-1" href="/admin">
                            <LayoutDashboard className="w-3 h-3" /> Admin Panel
                        </Link>
                    )}
                </div>
                <div className="flex space-x-4">
                    <span className="text-text-muted-light">
                        Delivery: <span className="font-semibold text-text-main-light">WW / EN</span>
                    </span>
                </div>
            </div>

            <nav className="bg-background-light/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center lg:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="text-text-main-light hover:text-primary p-2 transition-colors"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-shrink-0 flex items-center justify-center flex-1 md:flex-none">
                            <Link className="font-serif text-3xl tracking-widest font-bold text-text-main-light uppercase" href="/">
                                Socrati Official
                            </Link>
                        </div>
                        <nav className="hidden lg:flex items-center space-x-10 mx-auto">
                            <Link href="/women" className="text-[11px] uppercase tracking-[0.2em] font-bold text-text-main-light hover:text-primary transition-colors">
                                Women
                            </Link>
                            <Link href="/men" className="text-[11px] uppercase tracking-[0.2em] font-bold text-text-main-light hover:text-primary transition-colors">
                                Men
                            </Link>
                            <Link href="/bags" className="text-[11px] uppercase tracking-[0.2em] font-bold text-text-main-light hover:text-primary transition-colors">
                                Bags
                            </Link>
                            <Link href="/accessories" className="text-[11px] uppercase tracking-[0.2em] font-bold text-text-main-light hover:text-primary transition-colors">
                                Accessories
                            </Link>
                        </nav>
                        <div className="flex items-center space-x-4">
                            {session ? (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href="/account"
                                        className="flex items-center gap-2 group"
                                    >
                                        <span className="text-[10px] uppercase tracking-widest font-black text-primary hidden sm:block">
                                            Hi, {session.user?.name?.split(' ')[0]}
                                        </span>
                                        <User className="w-5 h-5 text-text-main-light group-hover:text-primary transition-colors" />
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="text-text-main-light hover:text-primary transition-colors p-1"
                                        title="Sign Out"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login" className="text-text-main-light hover:text-primary transition-colors p-1">
                                    <User className="w-5 h-5" />
                                </Link>
                            )}
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className={`text-text-main-light transition-colors p-1 hover:text-primary ${isSearchOpen ? 'text-primary' : ''}`}
                                title="Search"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                            <button className="text-text-main-light hover:text-primary transition-colors p-1 hidden sm:block">
                                <Heart className="w-5 h-5" />
                            </button>
                            <Link href="/cart" className="text-text-main-light hover:text-primary transition-colors p-1 relative">
                                <ShoppingBag className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Inline Search UI Below Header */}
            <div className={`absolute left-0 right-0 bg-white shadow-2xl transition-all duration-500 overflow-hidden transform origin-top z-40 border-b border-gray-100 ${isSearchOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                }`}>
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <form onSubmit={handleSearchSubmit} className="relative mb-12">
                        <input
                            type="text"
                            autoFocus={isSearchOpen}
                            placeholder="WHAT ARE YOU LOOKING FOR?"
                            className="w-full border-b border-gray-200 py-4 text-2xl font-serif text-text-main-light focus:outline-none focus:border-primary transition-colors uppercase tracking-tight placeholder:text-gray-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-primary">
                            <Search className="w-6 h-6" />
                        </button>
                    </form>

                    {/* Results Container */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-h-[450px]">
                        {/* Quick Results */}
                        <div className="flex flex-col">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Suggested Products</h3>
                            <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar" style={{ maxHeight: '320px' }}>
                                {isSearching ? (
                                    <div className="py-4 text-sm text-gray-400 font-serif italic">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/product/${product.id}`}
                                            onClick={() => setIsSearchOpen(false)}
                                            className="flex items-center gap-4 group"
                                        >
                                            <div className="w-16 h-20 bg-gray-50 relative overflow-hidden flex-shrink-0">
                                                {product.images?.[0] && (
                                                    <Image
                                                        src={product.images[0].url}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold uppercase tracking-wide text-text-main-light group-hover:text-primary transition-colors">{product.name}</h4>
                                                <p className="text-xs text-text-muted-light font-serif">{product.category.name}</p>
                                                <p className="text-xs font-bold mt-1 text-primary">R {Number(product.basePrice).toLocaleString()}</p>
                                            </div>
                                        </Link>
                                    ))
                                ) : searchQuery.length >= 2 ? (
                                    <div className="py-4 text-sm text-gray-400 font-serif italic">No results found for "{searchQuery}"</div>
                                ) : (
                                    <div className="py-4 text-sm text-gray-400 font-serif italic">Type to search...</div>
                                )}
                            </div>
                        </div>

                        {/* Recent Brands/Terms or Quick Links */}
                        <div className="hidden md:block border-l border-gray-100 pl-12 h-full">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Popular Collections</h3>
                            <div className="space-y-4">
                                <Link href="/women?category=shoes" onClick={() => setIsSearchOpen(false)} className="block text-sm font-medium hover:text-primary transition-colors uppercase tracking-widest">Women's Shoes</Link>
                                <Link href="/men?category=classic" onClick={() => setIsSearchOpen(false)} className="block text-sm font-medium hover:text-primary transition-colors uppercase tracking-widest">Men's Classics</Link>
                                <Link href="/bags" onClick={() => setIsSearchOpen(false)} className="block text-sm font-medium hover:text-primary transition-colors uppercase tracking-widest">Handbags</Link>
                                <Link href="/about" onClick={() => setIsSearchOpen(false)} className="block text-sm font-medium hover:text-primary transition-colors uppercase tracking-widest">Corporate Identity</Link>
                            </div>
                        </div>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="mt-8 text-center border-t border-gray-50 pt-6">
                            <button
                                onClick={handleSearchSubmit}
                                className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary hover:text-text-main-light transition-colors border-b border-primary hover:border-text-main-light pb-1"
                            >
                                View all results ({searchResults.length}+)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
