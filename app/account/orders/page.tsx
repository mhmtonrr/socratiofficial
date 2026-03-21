
'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

type Order = {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: any;
    shippingCost: any;
    shippingAddress: any;
    createdAt: string;
    items: any[];
};

export default function UserOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders');
                const data = await res.json();
                if (Array.isArray(data)) setOrders(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="space-y-4 animate-pulse"><div className="h-24 bg-gray-50 rounded-xl"></div><div className="h-24 bg-gray-50 rounded-xl"></div></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-8 pb-4 border-b border-gray-100 italic">My Order History</h2>

            <div className="space-y-4">
                {orders.length === 0 ? (
                    <p className="text-sm text-gray-400 font-serif italic text-center py-20">You haven't placed any orders yet.</p>
                ) : (
                    orders.map((order) => {
                        const isExpanded = expandedId === order.id;
                        return (
                            <div key={order.id} className="border border-gray-100 rounded-xl overflow-hidden bg-white">
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                    className="w-full flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-gray-50/50 transition-all text-left gap-4"
                                >
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-grow">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Order No</p>
                                            <p className="text-xs font-bold tabular-nums">#{order.orderNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Date</p>
                                            <p className="text-xs font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total</p>
                                            <p className="text-xs font-bold font-serif">R {Number(order.totalAmount).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 px-3 py-1 rounded-full">
                                            {order.status}
                                        </span>
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="p-8 bg-gray-50/50 border-t border-gray-50 space-y-8 animate-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Item Details</h4>
                                            {order.items.map((item, idx) => {
                                                const productMainImage = item.variant?.product?.images?.[0]?.url;
                                                return (
                                                    <div key={idx} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0 text-xs">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative w-16 h-20 bg-white border border-gray-100 overflow-hidden flex-shrink-0">
                                                                {productMainImage ? (
                                                                    <Image
                                                                        src={productMainImage}
                                                                        alt={item.productName}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <ShoppingBag className="w-4 h-4 text-gray-200" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-text-main-light mb-1">{item.productName}</p>
                                                                <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed">
                                                                    Color: {item.color || 'Original'} <br />
                                                                    Size: {item.size} <br />
                                                                    Quantity: {item.quantity}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold font-serif text-sm">R {Number(item.totalPrice).toLocaleString()}</p>
                                                            <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">R {Number(item.unitPrice).toLocaleString()} / unit</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row justify-between gap-6">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Delivery Address</h4>
                                                <p className="text-[11px] text-gray-600 leading-relaxed uppercase">
                                                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                                                    {order.shippingAddress.address}<br />
                                                    {order.shippingAddress.city}, {order.shippingAddress.zip}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex justify-between md:justify-end gap-10 text-xs mb-2">
                                                    <span className="text-gray-400">Subtotal:</span>
                                                    <span className="font-medium">R {(Number(order.totalAmount) - Number(order.shippingCost)).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between md:justify-end gap-10 text-xs mb-2">
                                                    <span className="text-gray-400">Shipping:</span>
                                                    <span className="font-medium">R {Number(order.shippingCost).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between md:justify-end gap-10 text-sm font-bold pt-2 border-t border-gray-100">
                                                    <span>Total:</span>
                                                    <span className="text-primary font-serif">R {Number(order.totalAmount).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
