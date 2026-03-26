'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Package, Search, Download, Upload, Save, History, AlertTriangle, AlertCircle, TrendingDown, TrendingUp, X } from 'lucide-react';
import Link from 'next/link';

interface Variant {
    id: string;
    sku: string;
    size: string | null;
    color: string;
    stock: number;
    lowStockThreshold: number;
    product: {
        name: string;
        isActive: boolean;
        images: { url: string }[];
        category: { name: string };
    };
}

interface StockHistory {
    id: string;
    change: number;
    reason: string;
    createdAt: string;
    user: { firstName: string | null; email: string } | null;
}

export default function AdminInventoryPage() {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [filteredVariants, setFilteredVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
    
    // Inline Editing
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ stock: 0, lowStockThreshold: 5, reason: 'Manual Adjustment' });

    // History Modal
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [historyVariant, setHistoryVariant] = useState<Variant | null>(null);
    const [histories, setHistories] = useState<StockHistory[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // CSV Import
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchInventory();
    }, []);

    useEffect(() => {
        let result = variants;
        if (searchQuery) {
            const lowerq = searchQuery.toLowerCase();
            result = result.filter(v => 
                v.sku.toLowerCase().includes(lowerq) || 
                v.product.name.toLowerCase().includes(lowerq)
            );
        }

        if (filter === 'low') {
            result = result.filter(v => v.stock <= v.lowStockThreshold && v.stock > 0);
        } else if (filter === 'out') {
            result = result.filter(v => v.stock === 0);
        }
        setFilteredVariants(result);
    }, [searchQuery, filter, variants]);

    const fetchInventory = async () => {
        try {
            const res = await fetch('/api/admin/inventory');
            const data = await res.json();
            setVariants(data);
            setFilteredVariants(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveInline = async (variant: Variant) => {
        try {
            const res = await fetch(`/api/admin/inventory/${variant.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stock: editForm.stock,
                    lowStockThreshold: editForm.lowStockThreshold,
                    reason: editForm.reason
                })
            });

            if (res.ok) {
                // update locally
                setVariants(variants.map(v => v.id === variant.id ? { ...v, stock: editForm.stock, lowStockThreshold: editForm.lowStockThreshold } : v));
                setEditingId(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openHistory = async (variant: Variant) => {
        setHistoryVariant(variant);
        setHistoryModalOpen(true);
        setLoadingHistory(true);
        try {
            const res = await fetch(`/api/admin/inventory/history?variantId=${variant.id}`);
            const data = await res.json();
            setHistories(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const csvText = event.target?.result as string;
            // Basic CSV parser (assuming SKU,Stock,Threshold header)
            const lines = csvText.split('\n').filter(Boolean);
            const headers = lines[0].toLowerCase().split(',');
            const skuIdx = headers.findIndex(h => h.trim() === 'sku');
            const stockIdx = headers.findIndex(h => h.trim() === 'stock' || h.trim() === 'quantity');
            const thresholdIdx = headers.findIndex(h => h.trim() === 'threshold' || h.trim() === 'low_stock_threshold');

            if (skuIdx === -1 || stockIdx === -1) {
                alert("CSV must contain 'sku' and 'stock' headers.");
                setImporting(false);
                return;
            }

            const items = lines.slice(1).map(line => {
                const cols = line.split(',');
                return {
                    sku: cols[skuIdx]?.trim(),
                    stock: parseInt(cols[stockIdx]?.trim(), 10),
                    lowStockThreshold: thresholdIdx !== -1 ? parseInt(cols[thresholdIdx]?.trim(), 10) : undefined
                };
            }).filter(item => item.sku && !isNaN(item.stock));

            try {
                const res = await fetch('/api/admin/inventory/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items })
                });
                const result = await res.json();
                if (res.ok) {
                    alert(`Import successful: ${result.count} variants updated.`);
                    fetchInventory();
                } else {
                    alert(`Import failed: ${result.error || 'Unknown error'}`);
                }
            } catch (err) {
                console.error(err);
                alert('Import process failed.');
            } finally {
                setImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const downloadTemplate = () => {
        const headers = "SKU,Stock,Threshold\n";
        const sample = variants.slice(0, 3).map(v => `${v.sku},${v.stock},${v.lowStockThreshold}`).join('\n');
        const content = headers + (sample || "SAMPLE-SKU-001,10,5");
        
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'socrati_inventory_template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-black text-text-main-light mb-2 tracking-tight">Inventory Control</h1>
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-black">Centralized Stock Intelligence</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={downloadTemplate} className="px-6 py-3 bg-white text-gray-700 border border-gray-100 rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] hover:bg-gray-50 hover:text-primary transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <div>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv" />
                        <button disabled={importing} onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-text-main-light text-white rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] hover:bg-primary transition-all flex items-center gap-2 shadow-lg shadow-black/10">
                            <Upload className="w-4 h-4" /> {importing ? 'Importing...' : 'Import Sync'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total SKU Range</p>
                        <p className="text-2xl font-black text-text-main-light">{variants.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Package className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-rose-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-rose-400 font-bold mb-1">Critically Low Stock</p>
                        <p className="text-2xl font-black text-rose-500">{variants.filter(v => v.stock <= v.lowStockThreshold && v.stock > 0).length}</p>
                    </div>
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-red-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-red-500 font-bold mb-1">Out of Stock</p>
                        <p className="text-2xl font-black text-red-600">{variants.filter(v => v.stock === 0).length}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Quick Actions & Search */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by SKU or Product Name..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-[11px] font-black tracking-wide text-text-main-light focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 placeholder:font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto bg-gray-50 p-1.5 rounded-2xl">
                    <button onClick={() => setFilter('all')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white text-text-main-light shadow-sm' : 'text-gray-400 hover:text-text-main-light'}`}>All</button>
                    <button onClick={() => setFilter('low')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'low' ? 'bg-amber-50 text-amber-600 shadow-sm' : 'text-gray-400 hover:text-amber-500'}`}>Low Stock</button>
                    <button onClick={() => setFilter('out')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'out' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-400 hover:text-red-500'}`}>Empty</button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                {loading ? (
                     <div className="p-20 text-center">
                        <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Loading Intelligence...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="p-6 pb-4 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold w-1/3">Product Identity</th>
                                    <th className="p-6 pb-4 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">SKU Reference</th>
                                    <th className="p-6 pb-4 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold text-center">Current Stock</th>
                                    <th className="p-6 pb-4 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold text-center">Threshold</th>
                                    <th className="p-6 pb-4 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold text-right" colSpan={2}>Admin Controls</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredVariants.map((variant) => {
                                    const isEditing = editingId === variant.id;
                                    const isOut = variant.stock === 0;
                                    const isLow = !isOut && variant.stock <= variant.lowStockThreshold;

                                    return (
                                        <tr key={variant.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-2xl relative overflow-hidden border border-gray-100">
                                                        {variant.product.images[0] && (
                                                            <Image src={variant.product.images[0].url} alt="" fill className="object-cover" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Link href={`/admin/products/edit/${variant.product.name}`} className="font-serif text-text-main-light font-medium group-hover:text-primary transition-colors pr-2">
                                                            {variant.product.name} {!variant.product.isActive && <span className="text-[9px] bg-red-50 text-red-600 px-2 py-0.5 rounded-sm uppercase tracking-widest font-bold ml-2">Draft</span>}
                                                        </Link>
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">
                                                            <span className="w-2.5 h-2.5 rounded-full inline-block mr-1 align-middle" style={{ backgroundColor: variant.color.toLowerCase() }}></span>
                                                            {variant.color} {variant.size && `• Size ${variant.size}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 font-mono text-[11px] text-gray-500 font-bold">
                                                {variant.sku}
                                            </td>
                                            <td className="p-6 text-center">
                                                {isEditing ? (
                                                    <input 
                                                        type="number"
                                                        value={editForm.stock}
                                                        onChange={e => setEditForm({...editForm, stock: Number(e.target.value)})}
                                                        className="w-20 pl-4 pr-1 py-2 bg-white border border-primary/30 rounded-xl text-center text-sm font-black text-text-main-light focus:ring-1 focus:ring-primary outline-none"
                                                    />
                                                ) : (
                                                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm ${isOut ? 'bg-red-50 text-red-600' : isLow ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-text-main-light'}`}>
                                                        {variant.stock}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6 text-center">
                                                {isEditing ? (
                                                    <input 
                                                        type="number"
                                                        value={editForm.lowStockThreshold}
                                                        onChange={e => setEditForm({...editForm, lowStockThreshold: Number(e.target.value)})}
                                                        className="w-16 pl-4 pr-1 py-2 bg-white border border-primary/30 rounded-xl text-center text-sm font-black text-text-main-light focus:ring-1 focus:ring-primary outline-none"
                                                    />
                                                ) : (
                                                    <span className="text-[11px] text-gray-400 font-black">
                                                        {"<="} {variant.lowStockThreshold}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6 text-right w-12 pr-2">
                                                <button onClick={() => openHistory(variant)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-text-main-light hover:bg-gray-100 transition-colors" title="Audit Log">
                                                    <History className="w-4 h-4" />
                                                </button>
                                            </td>
                                            <td className="p-6 text-right w-36 pl-0">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-end gap-2 flex-col items-end">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Reason (Optional)" 
                                                            value={editForm.reason}
                                                            onChange={e => setEditForm({...editForm, reason: e.target.value})}
                                                            className="w-full text-[9px] uppercase tracking-widest px-2 py-1.5 border border-gray-200 rounded-md font-bold text-gray-600 mb-1"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600">Cancel</button>
                                                            <button onClick={() => handleSaveInline(variant)} className="px-3 py-1.5 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-1"><Save className="w-3 h-3"/> Save</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => {
                                                        setEditingId(variant.id);
                                                        setEditForm({ stock: variant.stock, lowStockThreshold: variant.lowStockThreshold, reason: 'Manual Adjustment' });
                                                    }} className="px-6 py-2 border-2 border-gray-100 rounded-xl text-[9px] uppercase tracking-widest font-black text-gray-500 hover:border-primary hover:text-primary transition-colors">
                                                        Adjust
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* History Modal */}
            {historyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/20">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setHistoryModalOpen(false)}></div>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl relative overflow-hidden flex-shrink-0">
                                    {historyVariant?.product.images[0] && <Image src={historyVariant.product.images[0].url} alt="" fill className="object-cover" />}
                                </div>
                                <div>
                                    <h3 className="font-serif text-2xl text-text-main-light">Audit Log</h3>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-1">
                                        {historyVariant?.product.name} • SKU: {historyVariant?.sku}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setHistoryModalOpen(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-black transition-colors"><X className="w-5 h-5"/></button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto flex-grow bg-gray-50/30">
                            {loadingHistory ? (
                                <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>
                            ) : histories.length === 0 ? (
                                <p className="text-center py-20 text-[10px] font-black uppercase tracking-widest text-gray-400">No stock changes recorded yet.</p>
                            ) : (
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                    {histories.map((log) => {
                                        const isReduction = log.change < 0;
                                        return (
                                            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative left-0 md:left-1/2 -translate-x-[50%] md:translate-x-0">
                                                    {isReduction ? <TrendingDown className="w-4 h-4 text-red-500" /> : <TrendingUp className="w-4 h-4 text-emerald-500" />}
                                                </div>
                                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-3xl border border-gray-100 shadow-sm ml-auto md:ml-0 md:group-even:pl-6 md:group-odd:pr-6">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${isReduction ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                            {isReduction ? '' : '+'}{log.change} UNITS
                                                        </span>
                                                        <span className="text-[9px] uppercase tracking-widest font-bold text-gray-300">
                                                            {new Date(log.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-text-main-light leading-snug">{log.reason}</p>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400 mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                                                        <UserCircle className="w-3 h-3"/> By {log.user?.firstName || log.user?.email || 'System Operation'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const UserCircle = ({className}: {className: string}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
)
