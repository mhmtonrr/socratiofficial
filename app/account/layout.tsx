
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <>
                <Header />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                </div>
                <Footer />
            </>
        );
    }

    if (!session) return null;

    const navItems = [
        { name: 'Overview', href: '/account' },
        { name: 'My Orders', href: '/account/orders' },
        { name: 'Profile Details', href: '/account/profile' },
        { name: 'Addresses', href: '/account/addresses' },
    ];

    return (
        <>
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="mb-12 border-b border-gray-100 pb-8">
                    <h1 className="text-3xl font-serif text-text-main-light mb-2">My Account</h1>
                    <p className="text-sm text-gray-500">Hello, {session.user?.name}. Here you can view your orders and update your information.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-12">
                    {/* Simple Menu */}
                    <nav className="w-full md:w-64 flex flex-col gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-4 py-3 text-xs uppercase tracking-widest font-bold transition-all border-l-2 ${isActive
                                        ? 'border-primary text-primary bg-gray-50/50'
                                        : 'border-transparent text-gray-400 hover:text-text-main-light hover:bg-gray-50/30'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Content Area */}
                    <div className="flex-grow min-w-0">
                        {children}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
