
'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, CheckCircle, Edit, X } from 'lucide-react';

interface Address {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    phone: string;
    street: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [saving, setSaving] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        firstName: '',
        lastName: '',
        phone: '',
        street: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'South Africa',
        isDefault: false
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/user/addresses');
            if (res.ok) {
                const data = await res.json();
                setAddresses(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setEditingAddress(null);
        setFormData({
            title: '',
            firstName: '',
            lastName: '',
            phone: '',
            street: '',
            addressLine2: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'South Africa',
            isDefault: addresses.length === 0
        });
        setIsFormOpen(true);
    };

    const handleOpenEdit = (addr: Address) => {
        setEditingAddress(addr);
        setFormData({
            title: addr.title,
            firstName: addr.firstName,
            lastName: addr.lastName,
            phone: addr.phone,
            street: addr.street,
            addressLine2: addr.addressLine2 || '',
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode,
            country: addr.country,
            isDefault: addr.isDefault
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            const res = await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setAddresses(addresses.filter(a => a.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const url = editingAddress ? `/api/user/addresses/${editingAddress.id}` : '/api/user/addresses';
        const method = editingAddress ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await fetchAddresses();
                setIsFormOpen(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const res = await fetch(`/api/user/addresses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isDefault: true })
            });
            if (res.ok) fetchAddresses();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Address Book</h2>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-text-main-light transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add New Address
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(i => (
                        <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-xl"></div>
                    ))}
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-gray-200 rounded-xl">
                    <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                    <p className="text-sm text-gray-400 font-serif italic mb-6">No addresses saved yet.</p>
                    <button
                        onClick={handleOpenAdd}
                        className="text-[10px] uppercase tracking-widest bg-text-main-light text-white px-8 py-3 font-bold hover:bg-primary transition-all"
                    >
                        Add Your First Address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className={`p-8 border rounded-xl transition-all relative ${addr.isDefault ? 'border-primary bg-primary/[0.02]' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            {addr.isDefault && (
                                <div className="absolute top-8 right-8 text-primary flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Default</span>
                                </div>
                            )}

                            <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {addr.title}
                            </h3>

                            <div className="text-sm text-gray-600 font-light space-y-1 mb-6">
                                <p className="font-bold text-text-main-light">{addr.firstName} {addr.lastName}</p>
                                <p>{addr.street}</p>
                                {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                                <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                                <p>{addr.country}</p>
                                <p className="pt-2 text-[11px] text-gray-400 tabular-nums">{addr.phone}</p>
                            </div>

                            <div className="flex items-center gap-6 pt-6 border-t border-gray-100/50">
                                <button
                                    onClick={() => handleOpenEdit(addr)}
                                    className="text-[10px] uppercase tracking-widest font-black text-gray-400 hover:text-primary flex items-center gap-1.5 transition-colors"
                                >
                                    <Edit className="w-3 h-3" /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(addr.id)}
                                    className="text-[10px] uppercase tracking-widest font-black text-gray-400 hover:text-rose-500 flex items-center gap-1.5 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                                {!addr.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(addr.id)}
                                        className="text-[10px] uppercase tracking-widest font-black text-primary hover:text-text-main-light ml-auto transition-colors"
                                    >
                                        Set as Default
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Address Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
                    <div className="relative bg-white w-full max-w-xl p-8 md:p-12 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setIsFormOpen(false)}
                            className="absolute top-8 right-8 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        <h2 className="text-2xl font-serif text-text-main-light mb-8">
                            {editingAddress ? 'Edit Address' : 'New Address'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Address Title (e.g., Home, Work)</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-primary transition-colors outline-none font-light"
                                    placeholder="Apartment, Studio, or Floor"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">First Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-primary transition-colors outline-none font-light"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Last Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-primary transition-colors outline-none font-light"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-primary transition-colors outline-none font-light tabular-nums"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Street Address</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.street}
                                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-primary transition-colors outline-none font-light"
                                        placeholder="House number and street name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Address Line 2 (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.addressLine2}
                                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-primary transition-colors outline-none font-light"
                                        placeholder="Apartment, suite, unit, etc."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">City / Suburb</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-primary transition-colors outline-none font-light"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Province</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-primary transition-colors outline-none font-light"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Zip Code</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.zipCode}
                                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-primary transition-colors outline-none font-light tabular-nums"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Country</label>
                                    <select
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-primary transition-colors outline-none font-light bg-transparent"
                                    >
                                        <option value="South Africa">South Africa</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="United States">United States</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="isDefault" className="text-xs text-gray-500 font-light">Set as default address</label>
                            </div>

                            <div className="flex gap-4 pt-8 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400 hover:text-text-main-light transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-4 bg-text-main-light text-white text-[10px] uppercase tracking-[0.2em] font-black hover:bg-primary transition-all disabled:opacity-50 shadow-xl"
                                >
                                    {saving ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
