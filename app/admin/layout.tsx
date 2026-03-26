
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Package, Bell, ChevronDown, UserCircle, Menu, X, CreditCard, Tag, LineChart, Image as ImageIcon, MessageSquare, ClipboardList } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar when route changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (status === 'unauthenticated' || (status === 'authenticated' && (session?.user as any).role !== 'ADMIN')) {
            router.push('/login');
        }
    }, [status, session, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
                <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Authenticating Collection Access...</p>
            </div>
        );
    }

    if (!session || (session.user as any).role !== 'ADMIN') {
        return null; // Will redirect
    }

    const navItems = [
        { label: 'Executive Overview', icon: LayoutDashboard, href: '/admin' },
        { label: 'Master Catalogue', icon: Package, href: '/admin/products' },
        { label: 'Inventory Control', icon: ClipboardList, href: '/admin/inventory' },
        { label: 'Client Orders', icon: ShoppingBag, href: '/admin/orders' },
        { label: 'Payments', icon: CreditCard, href: '/admin/payments' },
        { label: 'Artisanal Users', icon: Users, href: '/admin/users' },
        { label: 'Client Reviews', icon: MessageSquare, href: '/admin/reviews' },
        { label: 'Coupons & Perks', icon: Tag, href: '/admin/coupons' },
        { label: 'Reports & Analytics', icon: LineChart, href: '/admin/reports' },
        { label: 'Media Library', icon: ImageIcon, href: '/admin/media' },
        { label: 'Email Monitoring', icon: Bell, href: '/admin/emails' },
    ];

    return (
        <div className="flex min-h-screen bg-[#FDFDFD] relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Premium Dark Aesthetic */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-80 bg-[#1A1A1A] text-white flex flex-col 
                transition-transform duration-300 ease-in-out shadow-[20px_0_40px_rgba(0,0,0,0.05)]
                lg:translate-x-0 lg:static lg:h-screen lg:shadow-none
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-10 pt-12 flex justify-between items-start">
                    <Link href="/admin" className="block text-center space-y-2 group w-full">
                        <h1 className="font-serif text-3xl tracking-[0.1em] font-black uppercase group-hover:text-primary transition-colors">
                            Socrati
                        </h1>
                        <div className="h-0.5 w-12 bg-primary mx-auto rounded-full group-hover:w-20 transition-all duration-500"></div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-[0.4em] font-bold">Atelier Management</p>
                    </Link>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white absolute top-6 right-6"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-grow px-6 space-y-1.5 mt-8">
                    <p className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Operations Hub</p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 group ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 -translate-y-0.5 scale-[1.02]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-8 space-y-4">
                    <div className="h-px bg-white/5 mx-2"></div>
                    <Link
                        href="/"
                        className="flex items-center space-x-4 p-4 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Visit Boutique</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col min-h-screen w-0">
                {/* Header - Minimalist Glassmorphism */}
                <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-text-main-light border border-gray-100 hover:bg-gray-100 transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Maison Privilege</p>
                            <h2 className="text-sm font-black text-text-main-light uppercase tracking-widest">Atelier Dashboard</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-primary transition-all group">
                            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full ring-4 ring-white"></span>
                        </button>

                        <div className="h-10 w-px bg-gray-100 mx-2"></div>

                        <div className="flex items-center gap-4 group cursor-pointer pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-text-main-light uppercase tracking-widest leading-none mb-1">{session.user?.name || 'Managing Director'}</p>
                                <p className="text-[9px] font-black text-primary uppercase tracking-[0.1em]">{session.user?.email}</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500">
                                <UserCircle className="w-8 h-8 text-gray-300" />
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                    </div>
                </header>

                {/* Content Container */}
                <main className="flex-grow p-4 md:p-10 lg:p-14 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>

                    {/* Modern Footer */}
                    <footer className="mt-20 pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">&copy; 2026 SOCRATI. EXCLUSIVE ATELIER ACCESS.</p>
                        <div className="flex items-center gap-6">
                            <Link href="#" className="text-[10px] text-gray-300 hover:text-primary font-black uppercase tracking-widest transition-colors">Architecture Documentation</Link>
                            <Link href="#" className="text-[10px] text-gray-300 hover:text-primary font-black uppercase tracking-widest transition-colors">Privacy Sanctum</Link>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
}
