'use client';

import { useState, useEffect } from 'react';
import { CreditCard, ExternalLink, CheckCircle, XCircle, Clock, AlertCircle, Search, Filter } from 'lucide-react';
import Link from 'next/link';

type Payment = {
    id: string;
    provider: string;
    status: string;
    amount: any;
    currency: string;
    transactionId: string | null;
    pfPaymentId: string | null;
    createdAt: string;
    order: {
        id: string;
        orderNumber: string;
        guestEmail: string;
        status: string;
        user?: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string | null;
        } | null;
        items: { quantity: number; productName: string }[];
    };
};

const statusConfig: Record<string, { label: string; icon: any; classes: string }> = {
    COMPLETED: { label: 'Completed', icon: CheckCircle, classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    PENDING:   { label: 'Pending',   icon: Clock,        classes: 'bg-amber-50 text-amber-700 border-amber-200' },
    FAILED:    { label: 'Failed',    icon: XCircle,      classes: 'bg-rose-50 text-rose-700 border-rose-200' },
    REFUNDED:  { label: 'Refunded',  icon: AlertCircle,  classes: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await fetch('/api/admin/payments');
            if (res.ok) {
                const data = await res.json();
                setPayments(data);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = payments.filter((p) => {
        const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
        const q = search.toLowerCase();
        const matchesSearch =
            !q ||
            p.order.orderNumber.toLowerCase().includes(q) ||
            (p.order.guestEmail || '').toLowerCase().includes(q) ||
            (p.order.user?.email || '').toLowerCase().includes(q) ||
            (p.pfPaymentId || '').toLowerCase().includes(q) ||
            (p.transactionId || '').toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    // Summary stats
    const totalRevenue = payments
        .filter((p) => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingCount = payments.filter((p) => p.status === 'PENDING').length;
    const failedCount = payments.filter((p) => p.status === 'FAILED').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-serif text-text-main-light mb-2 font-medium">Payments</h1>
                <p className="text-xs text-gray-400 uppercase tracking-widest">All Payfast transactions — linked to orders and customers</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Payments', value: payments.length, sub: 'all time', accent: false },
                    { label: 'Revenue (ZAR)', value: `R ${totalRevenue.toLocaleString()}`, sub: 'completed only', accent: true },
                    { label: 'Pending', value: pendingCount, sub: 'awaiting ITN', accent: false },
                    { label: 'Failed / Cancelled', value: failedCount, sub: 'not captured', accent: false },
                ].map((stat, i) => (
                    <div key={i} className={`bg-white border border-gray-100 rounded-2xl p-6 shadow-sm ${stat.accent ? 'border-primary/20 bg-primary/5' : ''}`}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
                        <p className={`text-2xl font-serif font-bold ${stat.accent ? 'text-primary' : 'text-text-main-light'}`}>{stat.value}</p>
                        <p className="text-[9px] uppercase tracking-widest text-gray-300 mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                        className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors bg-white"
                        placeholder="Search by order, email, PF ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex bg-white border border-gray-100 rounded-xl p-1 gap-1">
                    {['ALL', 'COMPLETED', 'PENDING', 'FAILED'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${statusFilter === s ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-text-main-light'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Payment Status', 'Order', 'Customer', 'Provider / PF ID', 'Amount', 'Date', 'Actions'].map((h) => (
                                    <th key={h} className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center text-gray-300 font-serif italic">
                                        No payments found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((payment) => {
                                    const cfg = statusConfig[payment.status] || statusConfig.PENDING;
                                    const StatusIcon = cfg.icon;
                                    const customerName = payment.order.user
                                        ? `${payment.order.user.firstName || ''} ${payment.order.user.lastName || ''}`.trim()
                                        : null;
                                    const customerEmail = payment.order.user?.email || payment.order.guestEmail;
                                    const isGuest = !payment.order.user;

                                    return (
                                        <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors group">
                                            {/* Status */}
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${cfg.classes}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {cfg.label}
                                                </span>
                                            </td>

                                            {/* Order */}
                                            <td className="px-8 py-6">
                                                <div className="font-black text-sm text-text-main-light">
                                                    #{payment.order.orderNumber}
                                                </div>
                                                <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                                                    {payment.order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                                                </div>
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border mt-1 inline-block ${payment.order.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                    Order: {payment.order.status}
                                                </span>
                                            </td>

                                            {/* Customer */}
                                            <td className="px-8 py-6">
                                                {customerName && (
                                                    <div className="font-bold text-sm text-text-main-light">{customerName}</div>
                                                )}
                                                <div className="text-[11px] text-gray-400 font-medium">{customerEmail}</div>
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border mt-1 inline-block ${isGuest ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                    {isGuest ? 'Guest' : 'Member'}
                                                </span>
                                            </td>

                                            {/* Provider / ID */}
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <CreditCard className="w-3.5 h-3.5 text-primary" />
                                                    <span className="text-xs font-black text-text-main-light">{payment.provider}</span>
                                                </div>
                                                {payment.pfPaymentId && (
                                                    <div className="text-[10px] text-gray-400 font-mono">
                                                        PF: {payment.pfPaymentId}
                                                    </div>
                                                )}
                                                {payment.transactionId && (
                                                    <div className="text-[10px] text-gray-300 font-mono truncate max-w-[160px]">
                                                        TX: {payment.transactionId}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Amount */}
                                            <td className="px-8 py-6">
                                                <span className="font-black text-base text-text-main-light font-serif">
                                                    R {Number(payment.amount).toLocaleString()}
                                                </span>
                                                <div className="text-[9px] text-gray-300 uppercase tracking-widest">{payment.currency}</div>
                                            </td>

                                            {/* Date */}
                                            <td className="px-8 py-6 text-[11px] text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap">
                                                {new Date(payment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                <div className="text-[9px] text-gray-300 font-normal mt-0.5 normal-case tracking-normal">
                                                    {new Date(payment.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/admin/orders`}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary border-2 border-primary/10 bg-white hover:bg-primary hover:text-white hover:border-primary rounded-xl transition-all shadow-sm whitespace-nowrap"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        View Order
                                                    </Link>
                                                    {payment.order.user && (
                                                        <Link
                                                            href={`/admin/users`}
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 border-2 border-gray-100 bg-white hover:bg-gray-50 rounded-xl transition-all shadow-sm"
                                                            title="View customer"
                                                        >
                                                            Customer
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
