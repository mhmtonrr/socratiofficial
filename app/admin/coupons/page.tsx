'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, AlertCircle } from 'lucide-react';

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    // Form State
    const [code, setCode] = useState('');
    const [type, setType] = useState('PERCENTAGE');
    const [value, setValue] = useState('');
    const [minOrder, setMinOrder] = useState('');
    const [maxUses, setMaxUses] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/coupons');
            const data = await res.json();
            if (res.ok) {
                setCoupons(data);
            }
        } catch (error) {
            console.error('Failed to fetch coupons', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!code || !value) {
            setError('Code and Value are required');
            return;
        }

        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    type,
                    value: parseFloat(value),
                    minOrderValue: minOrder ? parseFloat(minOrder) : null,
                    maxUses: maxUses ? parseInt(maxUses) : null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Failed to create coupon');
                return;
            }

            // Reset form and reload
            setIsAdding(false);
            setCode('');
            setValue('');
            setMinOrder('');
            setMaxUses('');
            setType('PERCENTAGE');
            fetchCoupons();
        } catch (error) {
            setError('An unexpected error occurred');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
            fetchCoupons();
        } catch (error) {
            console.error('Failed to delete coupon', error);
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await fetch(`/api/admin/coupons/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            fetchCoupons();
        } catch (error) {
            console.error('Failed to toggle coupon', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-serif text-text-main-light">Coupons & Discounts</h1>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-text-main-light text-white px-4 py-2 flex items-center gap-2 hover:bg-primary transition-colors text-sm"
                >
                    <Plus className="w-4 h-4" />
                    {isAdding ? 'Cancel' : 'Add New Coupon'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <h2 className="text-lg font-medium text-text-main-light mb-4">Create New Coupon</h2>
                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 mb-4 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Coupon Code *</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="e.g. SUMMER20"
                                className="w-full border border-gray-200 p-3 text-sm focus:border-text-main-light focus:outline-none uppercase"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Discount Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full border border-gray-200 p-3 text-sm focus:border-text-main-light focus:outline-none bg-white"
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED">Fixed Amount (ZAR)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Discount Value *</label>
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={type === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 150'}
                                className="w-full border border-gray-200 p-3 text-sm focus:border-text-main-light focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Min. Order Value (ZAR)</label>
                            <input
                                type="number"
                                value={minOrder}
                                onChange={(e) => setMinOrder(e.target.value)}
                                placeholder="Optional"
                                className="w-full border border-gray-200 p-3 text-sm focus:border-text-main-light focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Total Uses Limit</label>
                            <input
                                type="number"
                                value={maxUses}
                                onChange={(e) => setMaxUses(e.target.value)}
                                placeholder="Unlimited if blank"
                                className="w-full border border-gray-200 p-3 text-sm focus:border-text-main-light focus:outline-none"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full bg-text-main-light text-white p-3 hover:bg-primary transition-colors text-sm uppercase tracking-widest"
                            >
                                Save Coupon
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500 font-medium">
                        <tr>
                            <th className="p-4">Code</th>
                            <th className="p-4">Type & Value</th>
                            <th className="p-4">Uses</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">Loading coupons...</td>
                            </tr>
                        ) : coupons.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                    <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    No coupons found. Create one above!
                                </td>
                            </tr>
                        ) : (
                            coupons.map((coupon) => (
                                <tr key={coupon.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 font-bold text-text-main-light">{coupon.code}</td>
                                    <td className="p-4">
                                        <span className={`inline-block px-2 py-1 text-[10px] uppercase tracking-widest font-bold mr-2 ${coupon.type === 'PERCENTAGE' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                            {coupon.type}
                                        </span>
                                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}% off` : `R${coupon.value} off`}
                                        {coupon.minOrderValue && <div className="text-xs text-gray-400 mt-1">Min: R{coupon.minOrderValue}</div>}
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {coupon.currentUses} / {coupon.maxUses || '∞'}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleActive(coupon.id, coupon.isActive)}
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                                coupon.isActive ? 'bg-green-100 text-green-700 hover:bg-rose-100 hover:text-rose-700' : 'bg-gray-200 text-gray-600 hover:bg-green-100 hover:text-green-700'
                                            }`}
                                        >
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="text-gray-400 hover:text-rose-600 transition-colors"
                                            title="Delete Coupon"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
