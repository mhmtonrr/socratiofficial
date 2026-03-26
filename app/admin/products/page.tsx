'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Package, Archive, AlertCircle, ChevronDown, Check, X, Download, Copy, Eye, EyeOff } from 'lucide-react';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [showRefine, setShowRefine] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Filter State
    const [filters, setFilters] = useState({
        categoryId: 'ALL',
        stockStatus: 'ALL' // ALL, HEALTHY, VULNERABLE, DEPLETED
    });

    const refineRef = useRef<HTMLDivElement>(null);
    const actionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();

        const handleClickOutside = (event: MouseEvent) => {
            if (refineRef.current && !refineRef.current.contains(event.target as Node)) setShowRefine(false);
            if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) setShowActions(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Fetch products error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            const data = await res.json();

            // Build full paths for display (e.g., "Women > Shoes > Boots")
            const buildPath = (cat: any): string => {
                let path = cat.name;
                let current = cat.parent;
                while (current) {
                    path = `${current.name} > ${path}`;
                    current = current.parent;
                }
                return path;
            };

            const processedCategories = data.map((cat: any) => ({
                ...cat,
                fullPath: buildPath(cat)
            })).sort((a: any, b: any) => a.fullPath.localeCompare(b.fullPath));

            setCategories(processedCategories);
        } catch (error) {
            console.error("Fetch categories error:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to archive this masterpiece from the gallery?')) return;

        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredProducts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredProducts.map(p => p.id));
        }
    };

    const toggleSelectProduct = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
        if (!confirm(`Are you sure you want to ${action} ${selectedIds.length} models?`)) return;
        
        try {
            const res = await fetch(`/api/admin/products/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ids: selectedIds }),
            });
            if (res.ok) {
                if (action === 'delete') {
                    setProducts(products.filter(p => !selectedIds.includes(p.id)));
                } else {
                    setProducts(products.map(p => selectedIds.includes(p.id) ? { ...p, isActive: action === 'activate' } : p));
                }
                setSelectedIds([]);
            }
        } catch (error) {
            console.error("Bulk action error:", error);
        }
        setShowActions(false);
    };

    const handleDuplicate = async (id: string) => {
        if (!confirm('Duplicate this masterpiece? The copy will be created as "Draft" (inactive).')) return;
        
        try {
            const res = await fetch(`/api/admin/products/${id}/duplicate`, { method: 'POST' });
            if (res.ok) {
                const newProduct = await res.json();
                fetchProducts(); // Refresh to get all populated details
            }
        } catch (error) {
            console.error('Duplicate error:', error);
        }
    };

    const getDescendantCategoryIds = (catId: string): string[] => {
        const ids = [catId];
        const children = categories.filter(c => c.parentId === catId);
        children.forEach(child => {
            ids.push(...getDescendantCategoryIds(child.id));
        });
        return ids;
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.name.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesCategory = filters.categoryId === 'ALL';
        if (!matchesCategory) {
            const validCategoryIds = getDescendantCategoryIds(filters.categoryId);
            matchesCategory = validCategoryIds.includes(p.categoryId);
        }

        const totalStock = p.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;
        let pStatus = 'HEALTHY';
        if (totalStock === 0) pStatus = 'DEPLETED';
        else if (totalStock < 10) pStatus = 'VULNERABLE';

        const matchesStock = filters.stockStatus === 'ALL' || pStatus === filters.stockStatus;

        return matchesSearch && matchesCategory && matchesStock;
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-black text-text-main-light mb-2 tracking-tight">Master Catalogue</h1>
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-black">Curation and inventory of Socrati designs</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="bg-primary text-white px-8 py-4 rounded-2xl uppercase text-[10px] tracking-[0.2em] font-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-[0_20px_40px_-12px_rgba(var(--primary-rgb),0.3)]"
                >
                    <Plus className="w-4 h-4" /> Curate New Model
                </Link>
            </div>

            {/* Management Hub */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search by model or collection..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-transparent bg-gray-50/50 text-xs font-medium focus:bg-white focus:border-primary/10 outline-none transition-all placeholder:text-gray-300"
                    />
                </div>

                <div className="flex gap-4 w-full md:w-auto relative">
                    {/* Refine Dropdown */}
                    <div ref={refineRef} className="relative">
                        <button
                            onClick={() => setShowRefine(!showRefine)}
                            className={`px-6 py-4 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${showRefine ? 'bg-primary text-white border-primary' : 'bg-gray-50/50 border-transparent text-gray-400 hover:bg-white hover:border-gray-100'}`}
                        >
                            <Filter className="w-4 h-4" /> Refine {(filters.categoryId !== 'ALL' || filters.stockStatus !== 'ALL') && <span className="w-2 h-2 bg-rose-500 rounded-full"></span>}
                        </button>

                        {showRefine && (
                            <div className="absolute right-0 mt-4 w-72 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 border-b border-gray-50 pb-4">Filter Masterpiece</h4>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-text-main-light opacity-50">By Boutique Category</label>
                                        <select
                                            value={filters.categoryId}
                                            onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                                            className="w-full p-3 rounded-xl bg-gray-50 border-none text-[11px] font-bold text-text-main-light outline-none"
                                        >
                                            <option value="ALL">All Collections</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.fullPath}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-text-main-light opacity-50">By Atelier Stock</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {['ALL', 'HEALTHY', 'VULNERABLE', 'DEPLETED'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => setFilters(prev => ({ ...prev, stockStatus: status }))}
                                                    className={`w-full p-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-all ${filters.stockStatus === status ? 'bg-primary/5 text-primary border border-primary/10' : 'bg-white border border-gray-50 text-gray-400'}`}
                                                >
                                                    {status}
                                                    {filters.stockStatus === status && <Check className="w-3 h-3" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setFilters({ categoryId: 'ALL', stockStatus: 'ALL' });
                                            setSearchTerm('');
                                        }}
                                        className="w-full mt-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-rose-400 hover:text-rose-600 transition-colors"
                                    >
                                        Reset All Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Global Actions */}
                    <div ref={actionsRef} className="relative">
                        <button
                            onClick={() => setShowActions(!showActions)}
                            className={`px-6 py-4 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${showActions ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-gray-50/50 border-transparent text-gray-400 hover:bg-white hover:border-gray-100'}`}
                        >
                            <Archive className="w-4 h-4" /> Global Actions
                        </button>

                        {showActions && (
                            <div className="absolute right-0 mt-4 w-64 bg-[#1A1A1A] text-white rounded-[2rem] shadow-2xl p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="space-y-2">
                                    <button className="w-full p-4 rounded-xl hover:bg-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all text-left">
                                        <Download className="w-4 h-4" /> Export Gallery
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('activate')}
                                        disabled={selectedIds.length === 0}
                                        className="w-full p-4 rounded-xl hover:bg-emerald-500/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all text-left text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <Eye className="w-4 h-4" /> Publish Selection ({selectedIds.length})
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('deactivate')}
                                        disabled={selectedIds.length === 0}
                                        className="w-full p-4 rounded-xl hover:bg-amber-500/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all text-left text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <EyeOff className="w-4 h-4" /> Deactivate Selection ({selectedIds.length})
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('delete')}
                                        disabled={selectedIds.length === 0}
                                        className="w-full p-4 rounded-xl hover:bg-rose-500/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all text-left text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="w-4 h-4" /> Archive Selection ({selectedIds.length})
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Catalogue Gallery */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                {/* Desktop View - Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-10 py-6 w-16">
                                    <button
                                        onClick={toggleSelectAll}
                                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? 'bg-primary border-primary text-white' : 'border-gray-200 hover:border-primary/50'}`}
                                    >
                                        {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 && <Check className="w-3 h-3" />}
                                    </button>
                                </th>
                                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Masterpiece</th>
                                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Identity</th>
                                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Investment</th>
                                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Stock Status</th>
                                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Created</th>
                                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Edit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Summoning Collection...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-300">
                                            <Archive className="w-12 h-12 opacity-20" />
                                            <p className="text-xs font-serif italic text-gray-400">No models found in the current selection.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const totalStock = product.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;
                                    const isLowStock = totalStock > 0 && totalStock < 10;
                                    const isOutOfStock = totalStock === 0;
                                    const isSelected = selectedIds.includes(product.id);

                                    return (
                                        <tr key={product.id} className={`hover:bg-gray-50/50 transition-all group ${isSelected ? 'bg-primary/5' : ''}`}>
                                            <td className="px-10 py-8">
                                                <button
                                                    onClick={() => toggleSelectProduct(product.id)}
                                                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white' : 'border-gray-200 group-hover:border-primary/50'}`}
                                                >
                                                    {isSelected && <Check className="w-3 h-3" />}
                                                </button>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="relative w-16 h-20 bg-gray-100 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                                                    {product.images?.[0] ? (
                                                        <Image src={product.images[0].url} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <Package className="w-6 h-6 opacity-20" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="text-sm font-black text-text-main-light mb-1 leading-tight">{product.name}</div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-0.5 rounded inline-block">
                                                    {product.category?.name || 'Uncategorized'}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 font-serif text-sm font-black text-text-main-light tabular-nums">
                                                R {Number(product.basePrice).toLocaleString()}
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                            {isOutOfStock ? 'Depleted' : isLowStock ? 'Vulnerable' : 'Healthy'}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-gray-400 flex items-center gap-2">
                                                        {totalStock} Units 
                                                        {!product.isActive && <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-[8px] uppercase tracking-widest">Draft</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                    {new Date(product.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 lg:group-hover:opacity-100 transition-all transform translate-x-2 lg:group-hover:translate-x-0">
                                                    <Link
                                                        href={`/admin/products/edit/${product.name}`}
                                                        className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary hover:border-primary/20 hover:shadow-lg transition-all"
                                                        title="Edit Details"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDuplicate(product.id)}
                                                        className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary hover:border-primary/20 hover:shadow-lg transition-all"
                                                        title="Duplicate Masterpiece"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-rose-500 hover:border-rose-100 hover:shadow-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View - Cards */}
                <div className="lg:hidden">
                    {loading ? (
                        <div className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Summoning Collection...</p>
                            </div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center gap-4 text-gray-300">
                                <Archive className="w-12 h-12 opacity-20" />
                                <p className="text-xs font-serif italic text-gray-400">No models found.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredProducts.map((product) => {
                                const totalStock = product.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;
                                const isOutOfStock = totalStock === 0;
                                const isLowStock = totalStock > 0 && totalStock < 10;
                                const isSelected = selectedIds.includes(product.id);

                                return (
                                    <div key={product.id} className={`p-6 flex flex-col gap-6 ${isSelected ? 'bg-primary/5' : 'bg-white'}`}>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => toggleSelectProduct(product.id)}
                                                className={`flex-shrink-0 w-5 h-5 mt-1 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white' : 'border-gray-200'}`}
                                            >
                                                {isSelected && <Check className="w-3 h-3" />}
                                            </button>

                                            <div className="relative w-20 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                                                {product.images?.[0] ? (
                                                    <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <Package className="w-6 h-6 opacity-20" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-grow min-w-0">
                                                <h3 className="text-[13px] font-black text-text-main-light mb-1 uppercase tracking-tight truncate">{product.name}</h3>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-0.5 rounded inline-block mb-2">
                                                    {product.category?.name || 'Uncategorized'}
                                                </p>
                                                <p className="font-serif text-sm font-black text-text-main-light mb-2">
                                                    R {Number(product.basePrice).toLocaleString()}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                        {totalStock} In Stock
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4 border-t border-gray-50">
                                                <Link
                                                    href={`/admin/products/edit/${product.name}`}
                                                    className="flex-grow py-3 bg-gray-50 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-primary/5 hover:text-primary transition-all border border-transparent active:border-primary/10"
                                                >
                                                    <Edit className="w-4 h-4" /> Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDuplicate(product.id)}
                                                    className="w-14 h-12 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400 hover:bg-primary/5 hover:text-primary transition-all border border-transparent"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="w-14 h-12 flex items-center justify-center bg-gray-50 rounded-xl text-rose-400 hover:bg-rose-500/5 transition-all border border-transparent"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
