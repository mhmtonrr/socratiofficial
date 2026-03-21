
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { ShoppingBag, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AccountDashboardPage() {
    const { data: session } = useSession();
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders');
                const data = await res.json();
                if (Array.isArray(data)) setRecentOrders(data.slice(0, 2));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="space-y-12">
            {/* Simple Welcome Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="p-8 border border-gray-100 rounded-xl bg-gray-50/30 flex items-start gap-6">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-100 shrink-0">
                        <ShoppingBag className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xs uppercase tracking-widest mb-2">Recent Orders</h3>
                        <p className="text-sm text-gray-500 mb-4">Check the status of your most recent acquisitions here.</p>
                        <Link href="/account/orders" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-2">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                <div className="p-8 border border-gray-100 rounded-xl bg-gray-50/30 flex items-start gap-6">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-100 shrink-0">
                        <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xs uppercase tracking-widest mb-2">Profile Settings</h3>
                        <p className="text-sm text-gray-500 mb-4">Manage your personal details and authentication security.</p>
                        <Link href="/account/profile" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-2">
                            Edit Profile <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                <div className="p-8 border border-gray-100 rounded-xl bg-gray-50/30 flex items-start gap-6">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-100 shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-xs uppercase tracking-widest mb-2">My Addresses</h3>
                        <p className="text-sm text-gray-500 mb-4">Save and manage your shipping and billing addresses for faster checkout.</p>
                        <Link href="/account/addresses" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-2">
                            Manage Addresses <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Recent Orders minimalist list */}
            <section>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 pb-2 border-b border-gray-100">Recent Activity</h2>
                <div className="space-y-4">
                    {loading ? (
                        <div className="h-20 bg-gray-50 animate-pulse rounded-lg"></div>
                    ) : recentOrders.length === 0 ? (
                        <p className="text-sm text-gray-400 font-serif italic">You haven't placed any orders yet.</p>
                    ) : (
                        recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-6 border border-gray-100 rounded-xl hover:bg-gray-50/30 transition-all">
                                <div>
                                    <p className="text-xs font-bold tabular-nums mb-1">#{order.orderNumber}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold mb-1">${Number(order.totalAmount).toLocaleString()}</p>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">{order.status}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
