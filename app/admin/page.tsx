
'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    ShoppingBag,
    Users,
    Package,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    DollarSign,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';

type DashboardData = {
    stats: {
        totalRevenue: number;
        totalOrders: number;
        pendingOrders: number;
        totalProducts: number;
        growth: number;
    };
    recentOrders: any[];
    lowStock: any[];
};

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch('/api/admin/dashboard');
                const result = await res.json();
                if (res.ok) {
                    setData(result);
                }
            } catch (error) {
                console.error('Fetch dashboard error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) return null;

    const cards = [
        {
            title: 'Total Revenue',
            value: `R ${data.stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            growth: '+12.5%',
            positive: true,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            title: 'Total Orders',
            value: data.stats.totalOrders.toString(),
            icon: ShoppingBag,
            growth: '+8.2%',
            positive: true,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            title: 'Pending Orders',
            value: data.stats.pendingOrders.toString(),
            icon: Clock,
            growth: '-2.4%',
            positive: true, // fewer pending might be good
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
        {
            title: 'Total Products',
            value: data.stats.totalProducts.toString(),
            icon: Package,
            growth: '+4',
            positive: true,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        }
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-serif text-text-main-light mb-2 font-bold tracking-tight">Executive Dashboard</h1>
                <p className="text-xs text-gray-400 uppercase tracking-[0.3em] font-black">Performance overview of Socrati boutique</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${card.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {card.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {card.growth}
                                </div>
                            </div>
                            <h3 className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">{card.title}</h3>
                            <p className="text-2xl font-serif font-black text-text-main-light">{card.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-50 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h2 className="text-lg font-serif font-bold text-text-main-light">Recent Orders</h2>
                        <Link href="/admin/orders" className="text-[10px] uppercase tracking-widest font-black text-primary hover:text-text-main-light transition-colors flex items-center gap-1">
                            View All <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Order</th>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Total</th>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-5">
                                            <p className="text-xs font-bold text-text-main-light">#{order.orderNumber}</p>
                                            <p className="text-[9px] text-gray-400 font-medium truncate max-w-[120px]">{order.guestEmail}</p>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-black text-text-main-light tabular-nums">
                                            R {Number(order.totalAmount).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full border ${order.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-[10px] text-gray-400 text-right font-medium">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Inventory Alerts & Quick Actions */}
                <div className="space-y-6">
                    {/* Low Stock Alerts */}
                    <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm p-8">
                        <h2 className="text-lg font-serif font-bold text-text-main-light mb-6 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" /> Inventory Alerts
                        </h2>
                        <div className="space-y-4">
                            {data.lowStock.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">No low stock alerts today.</p>
                            ) : (
                                data.lowStock.map((variant) => (
                                    <div key={variant.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-amber-50/50 transition-colors border border-transparent hover:border-amber-100">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-amber-600 flex-shrink-0">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-xs font-bold text-text-main-light line-clamp-1">{variant.product.name}</p>
                                            <p className="text-[9px] text-gray-400 uppercase font-black">Size {variant.size} • {variant.stock} left</p>
                                        </div>
                                        <Link href={`/admin/products/edit/${variant.productId}`} className="p-2 text-gray-300 hover:text-primary transition-colors">
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div className="bg-primary p-8 rounded-[2rem] shadow-lg shadow-primary/20 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-lg font-serif font-bold mb-2">Ready to expand?</h2>
                            <p className="text-xs text-white/70 mb-6 font-medium">Add new models to your collection and keep the boutique fresh.</p>
                            <Link
                                href="/admin/products/new"
                                className="inline-block bg-white text-primary px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-sm"
                            >
                                Add New Product
                            </Link>
                        </div>
                        <ShoppingBag className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 rotate-12" />
                    </div>
                </div>
            </div>
        </div>
    );
}
