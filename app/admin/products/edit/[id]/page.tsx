
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, X, Upload, Save, Eye, Package, Image as ImageIcon, Sparkles, Ruler, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState<any>({
        name: '',
        slug: '',
        description: '',
        basePrice: '',
        categoryId: '',
        details: [],
        care: '',
        images: [],
        variants: []
    });

    const getCategoryName = (cat: any) => {
        let name = cat.name;
        if (cat.parent) {
            name = `${cat.parent.name} > ${name}`;
            if (cat.parent.parent) {
                name = `${cat.parent.parent.name} > ${name}`;
            }
        }
        return name;
    }

    useEffect(() => {
        const fetchCategories = fetch('/api/admin/categories').then(res => res.json());
        const fetchProduct = fetch(`/api/admin/products`).then(res => res.json());

        Promise.all([fetchCategories, fetchProduct])
            .then(([categoriesData, allProducts]) => {
                const level3Categories = categoriesData.filter((cat: any) => cat.parent && cat.parent.parent);
                const sorted = level3Categories.sort((a: any, b: any) => getCategoryName(a).localeCompare(getCategoryName(b)));
                setCategories(sorted);

                const product = allProducts.find((p: any) => p.id === id);
                if (product) {
                    setFormData({
                        ...product,
                        basePrice: product.basePrice.toString(),
                        images: product.images.map((img: any) => ({ url: img.url, isMain: img.isMain })),
                        variants: product.variants.map((v: any) => ({ ...v, sku: v.sku || '', price: v.price?.toString() || '' }))
                    });
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading data:", err);
                setLoading(false);
            });
    }, [id]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleAddImage = () => {
        setFormData((prev: any) => ({ ...prev, images: [...prev.images, { url: '', isMain: false }] }));
    };

    const handleRemoveImage = (index: number) => {
        setFormData((prev: any) => ({ ...prev, images: prev.images.filter((_: any, i: number) => i !== index) }));
    };

    const handleImageChange = (index: number, value: string) => {
        const newImages = [...formData.images];
        newImages[index].url = value;
        setFormData((prev: any) => ({ ...prev, images: newImages }));
    };

    const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(index);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formDataUpload,
            });
            const data = await res.json();
            if (res.ok) {
                handleImageChange(index, data.url);
            } else {
                alert(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('An error occurred during upload');
        } finally {
            setUploading(null);
        }
    };

    const handleAddVariant = () => {
        setFormData((prev: any) => ({ ...prev, variants: [...prev.variants, { sku: '', size: '', color: '', colorHex: '#000000', stock: 10, price: '' }] }));
    };

    const handleRemoveVariant = (index: number) => {
        setFormData((prev: any) => ({ ...prev, variants: prev.variants.filter((_: any, i: number) => i !== index) }));
    };

    const handleVariantChange = (index: number, field: string, value: any) => {
        const newVariants = [...formData.variants] as any;
        newVariants[index][field] = value;
        setFormData((prev: any) => ({ ...prev, variants: newVariants }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    basePrice: Number(formData.basePrice),
                    variants: formData.variants.map((v: any) => ({
                        ...v,
                        stock: Number(v.stock),
                        price: v.price ? Number(v.price) : Number(formData.basePrice)
                    }))
                })
            });

            if (res.ok) {
                router.push('/admin/products');
            } else {
                alert('An error occurred while updating the product.');
            }
        } catch (error) {
            console.error("Submit error:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-pulse">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Summoning Masterpiece Details...</p>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Navigation & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 bg-gray-50/80 backdrop-blur-md py-6 z-30 border-b border-gray-100 -mx-4 px-4 m-0">
                <div>
                    <Link href="/admin/products" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-all font-black mb-2 group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Master Collection
                    </Link>
                    <h1 className="text-3xl font-serif font-black text-text-main-light tracking-tight">Refining: <span className="text-primary/60">{formData.name}</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary text-white px-10 py-4 uppercase text-[10px] tracking-[0.3em] font-black rounded-2xl shadow-[0_20px_40px_-12px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" /> {saving ? 'Preserving...' : 'Save Updates'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-12">
                    {/* Section 1: Essentials */}
                    <section className="bg-white rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
                            <Sparkles className="w-32 h-32" />
                        </div>

                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                                <Package className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-serif font-black text-text-main-light tracking-tight">Product Foundation</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black pl-1">Product Title</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    type="text"
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/30 text-sm font-medium focus:border-primary/20 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black pl-1">Brand Slug</label>
                                <input
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    required
                                    type="text"
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 text-sm font-bold text-primary/60 outline-none transition-all cursor-not-allowed"
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black pl-1">Design Philosophy / Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/30 text-sm font-medium focus:border-primary/20 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-300"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black pl-1">Collection Base Price (ZAR)</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">R</span>
                                    <input
                                        name="basePrice"
                                        value={formData.basePrice}
                                        onChange={handleChange}
                                        required
                                        type="number"
                                        className="w-full pl-10 pr-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/30 text-sm font-black text-primary focus:border-primary/20 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black pl-1">Boutique Category</label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/30 text-sm font-bold text-text-main-light focus:border-primary/20 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {getCategoryName(cat)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Visual Gallery */}
                    <section className="bg-white rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                    <ImageIcon className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-serif font-black text-text-main-light tracking-tight">Visual Masterpieces</h2>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddImage}
                                className="px-4 py-2 hover:bg-primary/5 rounded-xl transition-all text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 group"
                            >
                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Add Perspective
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {formData.images.map((img: any, idx: number) => (
                                <div key={idx} className="flex flex-col md:flex-row gap-6 p-6 rounded-3xl border-2 border-dashed border-gray-100 hover:border-primary/20 transition-all bg-gray-50/20 group/img">
                                    <div className="w-full md:w-32 h-32 rounded-2xl bg-gray-100 flex-shrink-0 relative overflow-hidden border border-gray-100">
                                        {img.url ? (
                                            <img src={img.url} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <ImageIcon className="w-8 h-8 opacity-20" />
                                            </div>
                                        )}
                                        {img.isMain && <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg">Primary</div>}
                                    </div>
                                    <div className="flex-grow space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black pl-1 flex justify-between">
                                            <span>Image Cinematic URL {idx + 1}</span>
                                            {idx > 0 && <button type="button" onClick={() => handleRemoveImage(idx)} className="text-rose-400 hover:text-rose-600 transition-colors uppercase py-0.5">Discard</button>}
                                        </label>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex gap-4">
                                                <input
                                                    value={img.url}
                                                    onChange={(e: any) => handleImageChange(idx, e.target.value)}
                                                    type="text"
                                                    className="w-full px-6 py-4 rounded-2xl border-2 border-white bg-white shadow-sm text-xs font-medium focus:border-primary/20 outline-none transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const update = formData.images.map((im: any, i: number) => ({ ...im, isMain: i === idx }));
                                                        setFormData((prev: any) => ({ ...prev, images: update }));
                                                    }}
                                                    className={`px-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${img.isMain ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}
                                                >
                                                    Main
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <label className="flex-grow cursor-pointer group/upload">
                                                    <div className="w-full px-6 py-3 rounded-xl border-2 border-dashed border-gray-100 group-hover/upload:border-primary/20 group-hover/upload:bg-white transition-all flex items-center justify-center gap-2 text-gray-400 group-hover/upload:text-primary">
                                                        <Upload className={`w-4 h-4 ${uploading === idx ? 'animate-bounce' : ''}`} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                                            {uploading === idx ? 'Uploading...' : 'Upload New Perspective'}
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(idx, e)}
                                                        disabled={uploading !== null}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 3: Artisanal Variants */}
                    <section className="bg-white rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <Ruler className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-serif font-black text-text-main-light tracking-tight">Artisanal Specifications</h2>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddVariant}
                                className="px-4 py-2 hover:bg-primary/5 rounded-xl transition-all text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 group"
                            >
                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Add SKU
                            </button>
                        </div>

                        <div className="space-y-6">
                            {formData.variants.map((v: any, idx: number) => (
                                <div key={idx} className="relative p-8 rounded-3xl bg-gray-50/30 border-2 border-gray-50/50 hover:border-primary/10 transition-all group/var">
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                        <div className="space-y-2 lg:col-span-1">
                                            <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">Reference SKU</label>
                                            <input required value={v.sku} onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)} type="text" placeholder="SKU-001" className="w-full px-4 py-3 rounded-xl border border-white bg-white shadow-sm text-xs font-black text-primary outline-none transition-all focus:border-primary/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">Boutique Size</label>
                                            <input required value={v.size} onChange={(e) => handleVariantChange(idx, 'size', e.target.value)} type="text" placeholder="38" className="w-full px-4 py-3 rounded-xl border border-white bg-white shadow-sm text-xs font-bold text-text-main-light outline-none transition-all focus:border-primary/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">Color Palette</label>
                                            <input required value={v.color} onChange={(e) => handleVariantChange(idx, 'color', e.target.value)} type="text" placeholder="Midnight Black" className="w-full px-4 py-3 rounded-xl border border-white bg-white shadow-sm text-xs font-bold text-text-main-light outline-none transition-all focus:border-primary/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">Hex Visual</label>
                                            <div className="relative">
                                                <input value={v.colorHex} onChange={(e) => handleVariantChange(idx, 'colorHex', e.target.value)} type="color" className="w-full h-[46px] p-1.5 rounded-xl border border-white bg-white shadow-sm cursor-pointer" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">Atelier Stock</label>
                                            <input value={v.stock} onChange={(e) => handleVariantChange(idx, 'stock', Number(e.target.value))} type="number" className="w-full px-4 py-3 rounded-xl border border-white bg-white shadow-sm text-xs font-black text-emerald-600 outline-none transition-all focus:border-primary/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">Price Adjust</label>
                                            <input value={v.price} onChange={(e) => handleVariantChange(idx, 'price', e.target.value)} type="number" placeholder="Optional" className="w-full px-4 py-3 rounded-xl border border-white bg-white shadow-sm text-xs font-black text-primary outline-none transition-all focus:border-primary/20" />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveVariant(idx)}
                                        className="absolute -top-3 -right-3 bg-white text-gray-300 hover:text-rose-500 hover:border-rose-100 transition-all rounded-full w-8 h-8 flex items-center justify-center border-2 border-gray-50 shadow-lg group-hover/var:scale-110 active:scale-95"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar: Details & Care */}
                <div className="lg:col-span-4 space-y-12">
                    <section className="bg-white rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-32">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-serif font-black text-text-main-light tracking-tight">Refined Details</h2>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-black pl-1">Exquisite Specifications</label>
                                <textarea
                                    value={formData.details.join('\n')}
                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, details: e.target.value.split('\n') }))}
                                    rows={8}
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/30 text-[13px] font-medium leading-relaxed outline-none focus:border-primary/20 focus:bg-white transition-all resize-none placeholder:opacity-30"
                                />
                                <p className="text-[9px] text-gray-400 italic">Enter one luxurious hallmark per line.</p>
                            </div>

                            <div className="space-y-4 border-t border-gray-50 pt-8">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-black pl-1">Preservation Guide</label>
                                <textarea
                                    value={formData.care}
                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, care: e.target.value }))}
                                    rows={5}
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/30 text-[13px] font-medium leading-relaxed italic text-gray-500 outline-none focus:border-primary/20 focus:bg-white transition-all resize-none"
                                />
                            </div>
                        </div>

                        <div className="mt-12 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-text-main-light">Masterpiece Live</span>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-relaxed">Updating these details will apply instantly to the boutique gallery. Ensure all specifications are accurate for your clientele.</p>
                        </div>
                    </section>
                </div>
            </div>
        </form>
    );
}
