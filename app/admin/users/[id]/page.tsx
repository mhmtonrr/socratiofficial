'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, User as UserIcon, Mail, Calendar, MapPin, ShoppingBag, Package, Ban, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type Order = {
    id: string;
    orderNumber: string;
    createdAt: string;
    totalAmount: string;
    status: string;
    items: Array<{
        productName: string;
        quantity: number;
        totalPrice: string;
    }>;
};

type Address = {
    id: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    isDefault: boolean;
};

type UserProfile = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: 'USER' | 'ADMIN';
    isSuspended: boolean;
    isVerified: boolean;
    createdAt: string;
    orders: Order[];
    addresses: Address[];
};

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/admin/users/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setUser(data);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center py-32">
            <div className="animate-spin w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full"></div>
        </div>
    );

    if (!user) return (
        <div className="text-center py-32 text-gray-500">
            User not found.
        </div>
    );

    const totalSpend = user.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
    };

    return (
        <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/users" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-all font-black mb-4 group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Directory
                    </Link>
                    <h1 className="text-3xl font-serif font-black text-text-main-light flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        {user.firstName} {user.lastName}
                    </h1>
                </div>
                <div className="flex gap-3">
                    {user.isSuspended && <div className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"><Ban className="w-4 h-4" /> Suspended</div>}
                    {user.role === 'ADMIN' && <div className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Curator</div>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Overview Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm md:col-span-1 space-y-6">
                    <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-4">Identity Details</h2>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-300" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Email Address</span>
                                <span className="text-sm font-medium text-text-main-light">{user.email}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-300" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Member Since</span>
                                <span className="text-sm font-medium text-text-main-light">{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {user.isVerified ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Ban className="w-4 h-4 text-rose-300" />}
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Email Status</span>
                                <span className="text-sm font-medium text-text-main-light">{user.isVerified ? 'Verified' : 'Unverified'}</span>
                            </div>
                        </div>
                    </div>

                    {user.addresses.length > 0 && (
                        <div className="pt-6 border-t border-gray-100 space-y-4">
                            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Saved Addresses</h2>
                            <div className="space-y-3">
                                {user.addresses.map(addr => (
                                    <div key={addr.id} className="p-3 bg-gray-50 rounded-xl flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-gray-300 mt-0.5" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-text-main-light">
                                                {addr.street}, {addr.city}
                                            </span>
                                            <span className="text-[10px] text-gray-500">{addr.state}, {addr.postalCode} | {addr.phone}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="md:col-span-2 space-y-6">
                    {/* Insights Hub */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-2 justify-center">
                                <ShoppingBag className="w-5 h-5 text-gray-300" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Orders</span>
                            </div>
                            <p className="text-4xl font-serif font-black text-text-main-light text-center">{user.orders.length}</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-2 justify-center">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Lifetime Spend</span>
                            </div>
                            <p className="text-4xl font-serif font-black text-primary text-center">{formatCurrency(totalSpend)}</p>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Order History
                        </h2>
                        
                        {user.orders.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 italic text-sm">
                                This user has not placed any orders yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {user.orders.map(order => (
                                    <div key={order.id} className="border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-colors bg-gray-50/30">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                                            <div>
                                                <div className="text-sm font-black text-text-main-light mb-1">{order.orderNumber}</div>
                                                <div className="text-[10px] uppercase font-bold text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-primary">{formatCurrency(Number(order.totalAmount))}</div>
                                                    <div className="text-[10px] uppercase font-bold text-gray-400">{order.items.length} Items</div>
                                                </div>
                                                <div className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-text-main-light">
                                                    {order.status}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-2">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-xs items-center">
                                                    <span className="text-gray-600 font-medium">{item.quantity}x {item.productName}</span>
                                                    <span className="text-text-main-light font-bold">{formatCurrency(Number(item.totalPrice))}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
