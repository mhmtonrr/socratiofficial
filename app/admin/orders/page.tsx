
'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Eye, CheckCircle, Truck, Package, XCircle, MoreVertical } from 'lucide-react';
import Image from 'next/image';

type OrderItem = {
    id: string;
    productName: string;
    sku: string;
    size: string | null;
    color: string | null;
    quantity: number;
    unitPrice: any;
    totalPrice: any;
    variant?: {
        product: {
            images: { url: string }[];
        }
    }
};

type Order = {
    id: string;
    orderNumber: string;
    guestEmail: string;
    status: string;
    totalAmount: any;
    shippingCost: any;
    shippingAddress: any;
    createdAt: string;
    items: OrderItem[];
    userId: string | null;
    user?: {
        name: string | null;
        email: string | null;
    };
    payment?: {
        id: string;
        provider: string;
        status: string;
        amount: any;
        currency: string;
        pfPaymentId: string | null;
        transactionId: string | null;
    } | null;
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [activeTab, setActiveTab] = useState('ALL');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders');
            const data = await res.json();
            if (res.ok) {
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });
            if (res.ok) {
                fetchOrders(); // Refresh list
                if (selectedOrder?.id === id) {
                    setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'PAID': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'PROCESSING': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'SHIPPED': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'DELIVERED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'CANCELLED': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const filteredOrders = activeTab === 'ALL'
        ? orders
        : orders.filter(o => o.status === activeTab);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif text-text-main-light mb-2 font-medium">Orders Management</h1>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Track and manage customer orders</p>
                </div>
                <div className="flex bg-white border border-gray-100 p-1 rounded-lg">
                    {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${activeTab === tab
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-gray-400 hover:text-text-main-light'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Order Ref</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Items</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Total</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-10 py-24 text-center text-gray-300 font-serif italic">
                                        No orders found in this category.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-10 py-8 font-black text-[13px] text-text-main-light tabular-nums">
                                            #{order.orderNumber}
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="text-[13px] font-black text-text-main-light mb-1">
                                                {order.user?.name || order.guestEmail}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {order.userId ? (
                                                    <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                                                        Member
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-100">
                                                        Guest
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-gray-400 tabular-nums lowercase font-medium">{order.user?.email || order.guestEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-[13px] text-gray-500 tabular-nums font-bold">
                                            {order.items.reduce((acc, item) => acc + item.quantity, 0)} Units
                                        </td>
                                        <td className="px-10 py-8 font-black text-[13px] text-text-main-light tabular-nums">
                                            R {Number(order.totalAmount).toLocaleString()}
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border shadow-sm ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                                            {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-primary border-2 border-primary/10 bg-white hover:bg-primary hover:text-white hover:border-primary transition-all rounded-xl flex items-center gap-2 ml-auto shadow-sm"
                                            >
                                                <Eye className="w-4 h-4" /> View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden">
                    {filteredOrders.length === 0 ? (
                        <div className="px-6 py-24 text-center text-gray-300 font-serif italic">
                            No orders found.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="p-6 flex flex-col gap-6 bg-white hover:bg-gray-50/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-[14px] font-black text-text-main-light mb-1 uppercase tracking-tight">#{order.orderNumber}</div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold tabular-nums">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="text-[13px] font-bold text-gray-600 truncate max-w-[200px]">
                                                {order.user?.name || order.guestEmail}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[15px] font-black text-text-main-light mb-1">
                                                R {Number(order.totalAmount).toLocaleString()}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase">
                                                {order.items.reduce((acc, item) => acc + item.quantity, 0)} Items
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="w-full py-4 bg-gray-50 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:bg-primary/5 hover:text-primary transition-all border border-transparent shadow-inner"
                                    >
                                        <Eye className="w-4 h-4" /> Order Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[94vh] overflow-hidden flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20">
                        <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-br from-gray-50 to-white">
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <h3 className="text-3xl font-serif font-bold text-text-main-light tracking-tight">Order #{selectedOrder.orderNumber}</h3>
                                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-full border shadow-sm ${getStatusColor(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                                    <p>Placed {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <p>{new Date(selectedOrder.createdAt).toLocaleTimeString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-all group border border-transparent hover:border-rose-100">
                                <XCircle className="w-8 h-8 text-gray-300 group-hover:text-rose-400" />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
                            {/* Premium Status Management Section */}
                            <div className="mb-14">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-main-light mb-6 flex items-center gap-2 border-l-4 border-primary pl-4">
                                    Manage Order Lifecycle
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {[
                                        { id: 'PENDING', label: 'Pending', icon: Package, desc: 'Awaiting process' },
                                        { id: 'PROCESSING', label: 'In Progress', icon: CheckCircle, desc: 'Being prepared' },
                                        { id: 'SHIPPED', label: 'Shipped', icon: Truck, desc: 'On its way' },
                                        { id: 'DELIVERED', label: 'Delivered', icon: ShoppingBag, desc: 'Handed over' },
                                        { id: 'CANCELLED', label: 'Cancelled', icon: XCircle, desc: 'Order voided' },
                                    ].map((s) => {
                                        const StatusIcon = s.icon;
                                        const isCurrent = selectedOrder.status === s.id;
                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => updateOrderStatus(selectedOrder.id, s.id)}
                                                className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all gap-4 text-left group relative overflow-hidden ${isCurrent
                                                    ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20 -translate-y-1'
                                                    : 'border-gray-100 bg-white text-gray-400 hover:border-primary/20 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <StatusIcon className={`w-6 h-6 ${isCurrent ? 'text-white' : 'text-gray-300 group-hover:text-primary transition-colors'}`} />
                                                <div>
                                                    <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${isCurrent ? 'text-white' : 'text-text-main-light'}`}>{s.label}</p>
                                                    <p className={`text-[9px] font-medium leading-none ${isCurrent ? 'text-white/70' : 'text-gray-400'}`}>{s.desc}</p>
                                                </div>
                                                {isCurrent && <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full blur-xl"></div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary underline underline-offset-8">Customer Info</h4>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-text-main-light">{selectedOrder.guestEmail}</p>
                                        <p className="text-[11px] text-gray-500 uppercase tracking-widest font-medium">Guest Session</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary underline underline-offset-8">Shipping Address</h4>
                                    <div className="text-[12px] text-gray-600 leading-relaxed uppercase font-medium">
                                        {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}<br />
                                        {selectedOrder.shippingAddress.address}<br />
                                        {selectedOrder.shippingAddress.zip} {selectedOrder.shippingAddress.city}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary underline underline-offset-8">Payment Info</h4>
                                    {selectedOrder.payment ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <p className="text-[12px] text-gray-600 font-black uppercase tracking-widest">{selectedOrder.payment.provider}</p>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${
                                                    selectedOrder.payment.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    selectedOrder.payment.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>{selectedOrder.payment.status}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 font-medium">Amount: <span className="font-black text-text-main-light">R {Number(selectedOrder.payment.amount).toLocaleString()} {selectedOrder.payment.currency}</span></p>
                                            {selectedOrder.payment.pfPaymentId && (
                                                <p className="text-[10px] text-gray-400 font-mono">PF ID: {selectedOrder.payment.pfPaymentId}</p>
                                            )}
                                            {selectedOrder.payment.transactionId && (
                                                <p className="text-[10px] text-gray-400 font-mono truncate max-w-[220px]">TX: {selectedOrder.payment.transactionId}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-gray-400 italic">No payment record found</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4" /> Ordered Items
                                </h4>
                                <div className="border border-gray-100 rounded-3xl overflow-hidden text-[11px] bg-white shadow-sm">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-8 p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                            <div className="bg-gray-50 w-20 h-24 relative rounded-xl overflow-hidden flex-shrink-0 shadow-inner group">
                                                {item.variant?.product.images?.[0] ? (
                                                    <Image
                                                        src={item.variant.product.images[0].url}
                                                        alt={item.productName}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <ShoppingBag className="w-8 h-8 opacity-20" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <h5 className="font-black text-sm text-text-main-light mb-2 tracking-tight">{item.productName}</h5>
                                                <div className="flex gap-6 uppercase font-bold text-[10px] text-gray-400 tracking-widest">
                                                    <span className="flex items-center gap-1"><span className="w-1 h-1 bg-gray-300 rounded-full"></span> SKU: {item.sku}</span>
                                                    <span className="flex items-center gap-1"><span className="w-1 h-1 bg-gray-300 rounded-full"></span> Size: {item.size}</span>
                                                    <span className="flex items-center gap-1"><span className="w-1 h-1 bg-gray-300 rounded-full"></span> Color: {item.color}</span>
                                                </div>
                                            </div>
                                            <div className="text-right tabular-nums">
                                                <div className="font-bold text-gray-400 text-[10px] uppercase mb-1">R {Number(item.unitPrice).toLocaleString()} &times; {item.quantity}</div>
                                                <div className="text-primary font-black text-lg">R {Number(item.totalPrice).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-10 bg-gray-50/80 backdrop-blur-md border-t border-gray-100">
                            <div className="max-w-md ml-auto space-y-4">
                                <div className="flex justify-between text-[11px] text-gray-500 uppercase font-black tracking-[0.1em]">
                                    <span>Subtotal</span>
                                    <span className="text-text-main-light font-bold">R {(Number(selectedOrder.totalAmount) - Number(selectedOrder.shippingCost)).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-gray-500 uppercase font-black tracking-[0.1em]">
                                    <span>Boutique Shipping</span>
                                    <span className="text-text-main-light font-bold">R {Number(selectedOrder.shippingCost).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-2xl font-serif border-t border-gray-200 pt-5">
                                    <span className="font-medium text-text-main-light tracking-tight italic">Grand Total</span>
                                    <span className="font-black text-primary text-3xl">R {Number(selectedOrder.totalAmount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
