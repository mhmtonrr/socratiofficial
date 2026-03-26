'use client';

import { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Download, Calendar, TrendingUp, ShoppingBag, CreditCard, ChevronDown, Check } from 'lucide-react';
import { format, subDays, startOfMonth, startOfYear, endOfDay } from 'date-fns';
import * as XLSX from 'xlsx';

type DatePreset = 'last7' | 'last30' | 'thisMonth' | 'thisYear';

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [preset, setPreset] = useState<DatePreset>('last30');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Date calculations
    const getDates = (p: DatePreset) => {
        const today = new Date();
        switch (p) {
            case 'last7': return { from: subDays(today, 7), to: today };
            case 'last30': return { from: subDays(today, 30), to: today };
            case 'thisMonth': return { from: startOfMonth(today), to: today };
            case 'thisYear': return { from: startOfYear(today), to: today };
            default: return { from: subDays(today, 30), to: today };
        }
    };

    const fetchReport = async (p: DatePreset) => {
        setLoading(true);
        const { from, to } = getDates(p);
        try {
            const res = await fetch(`/api/admin/reports?from=${from.toISOString()}&to=${to.toISOString()}`);
            const json = await res.json();
            if (res.ok) {
                setData(json);
            } else {
                console.error(json.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(preset);
    }, [preset]);

    const handlePresetChange = (p: DatePreset) => {
        setPreset(p);
        setIsDropdownOpen(false);
    };

    const exportToExcel = () => {
        if (!data) return;
        const wb = XLSX.utils.book_new();

        // Revenue Over Time
        const wsRevenue = XLSX.utils.json_to_sheet(data.revenueOverTime);
        XLSX.utils.book_append_sheet(wb, wsRevenue, 'Revenue Over Time');

        // Top Selling Products
        const wsProducts = XLSX.utils.json_to_sheet(data.topSellingProducts);
        XLSX.utils.book_append_sheet(wb, wsProducts, 'Top Products');

        // Best Customers
        const wsCustomers = XLSX.utils.json_to_sheet(data.bestCustomers);
        XLSX.utils.book_append_sheet(wb, wsCustomers, 'Best Customers');

        XLSX.writeFile(wb, `Socrati_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    const COLORS = ['#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6'];

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-text-main-light mb-2 font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-xs text-gray-400 uppercase tracking-[0.3em] font-black">Data-driven insights for your atelier</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Date Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-text-main-light hover:border-primary transition-colors focus:outline-none"
                        >
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {preset === 'last7' ? 'Last 7 Days' : preset === 'last30' ? 'Last 30 Days' : preset === 'thisMonth' ? 'This Month' : 'This Year'}
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-50 overflow-hidden">
                                <div className="p-2 space-y-1">
                                    {[
                                        { id: 'last7', label: 'Last 7 Days' },
                                        { id: 'last30', label: 'Last 30 Days' },
                                        { id: 'thisMonth', label: 'This Month' },
                                        { id: 'thisYear', label: 'This Year' },
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => handlePresetChange(opt.id as DatePreset)}
                                            className={`w-full text-left flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${preset === opt.id ? 'bg-primary/5 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            {opt.label}
                                            {preset === opt.id && <Check className="w-3 h-3 text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-3 bg-primary text-white border border-transparent px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#7A6448] shadow-sm transition-all focus:outline-none"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Loading Overlay when refreshing data but already have old data */}
            {loading && data && (
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-1/3 animate-ping"></div>
                </div>
            )}

            {data && (
                <>
                    {/* Overviews */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl flex-shrink-0">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Revenue</p>
                                <p className="text-2xl font-serif font-black text-text-main-light">R {data.totals.totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl flex-shrink-0">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Orders</p>
                                <p className="text-2xl font-serif font-black text-text-main-light">{data.totals.totalOrders}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl flex-shrink-0">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Avg Order Value</p>
                                <p className="text-2xl font-serif font-black text-text-main-light">R {Math.round(data.totals.averageOrderValue).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 1 */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-serif font-bold text-text-main-light mb-6">Revenue Over Time</h2>
                        <div className="h-[350px] w-full text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.revenueOverTime} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF' }} dy={10} />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF' }} tickFormatter={(value) => `R${value/1000}k`} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => [`R ${(value || 0).toLocaleString()}`, 'Revenue']}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#90795A" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Top Products */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-serif font-bold text-text-main-light mb-6">Top Selling Products</h2>
                            <div className="h-[300px] w-full text-xs">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.topSellingProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 10 }} width={120} />
                                        <Tooltip 
                                            cursor={{fill: '#F3F4F6'}}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: any, name: any) => [
                                                name === 'quantity' ? value : `R ${(value || 0).toLocaleString()}`, 
                                                name === 'quantity' ? 'Units Sold' : 'Revenue'
                                            ]}
                                        />
                                        <Bar dataKey="quantity" fill="#90795A" radius={[0, 4, 4, 0]} barSize={15} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Sales by Category */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-serif font-bold text-text-main-light mb-6">Sales by Category</h2>
                            <div className="h-[300px] w-full text-xs flex justify-center items-center">
                                {data.salesByCategory.length === 0 ? (
                                    <p className="text-gray-400">No category data available.</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.salesByCategory}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {data.salesByCategory.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => `R ${(value || 0).toLocaleString()}`} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Best Customers */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-serif font-bold text-text-main-light">Top Customers (By Spend)</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <th className="px-8 py-4">Customer Name</th>
                                        <th className="px-8 py-4">Email</th>
                                        <th className="px-8 py-4 text-center">Orders</th>
                                        <th className="px-8 py-4 text-right">Total Spend</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.bestCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-10 text-center text-sm text-gray-400">No customer data for this period.</td>
                                        </tr>
                                    ) : (
                                        data.bestCustomers.map((c: any, i: number) => (
                                            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-5 text-sm font-bold text-text-main-light">{c.name}</td>
                                                <td className="px-8 py-5 text-xs text-gray-500">{c.email}</td>
                                                <td className="px-8 py-5 text-sm font-bold text-text-main-light text-center">{c.ordersCount}</td>
                                                <td className="px-8 py-5 text-sm font-black text-primary text-right">R {c.spend.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
