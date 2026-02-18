'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState, Suspense } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface FilterSidebarProps {
    categories: any[];
    sizes: string[];
    colors: { name: string; hex: string | null }[];
    maxPrice: number;
}

function FilterSidebarContent({ categories, sizes, colors, maxPrice }: FilterSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [priceRange, setPriceRange] = useState(Number(searchParams.get('maxPrice')) || maxPrice);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Accordion states for sections
    const [expandedSections, setExpandedSections] = useState<string[]>(['category', 'colors', 'sizes', 'price']);

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    // Helper to get all values for a param (handles multi-select)
    const getParamValues = (name: string) => {
        const val = searchParams.get(name);
        if (!val) return [];
        return val.split(',');
    };

    // Helper to update URL params
    const createQueryString = useCallback(
        (name: string, value: string, isMulti: boolean = false) => {
            const params = new URLSearchParams(searchParams.toString());

            if (isMulti) {
                let currentValues = params.get(name)?.split(',') || [];
                if (currentValues.includes(value)) {
                    currentValues = currentValues.filter(v => v !== value);
                } else {
                    currentValues.push(value);
                }

                if (currentValues.length > 0) {
                    params.set(name, currentValues.join(','));
                } else {
                    params.delete(name);
                }
            } else {
                if (value) {
                    params.set(name, value);
                } else {
                    params.delete(name);
                }
            }
            return params.toString();
        },
        [searchParams]
    );

    const toggleFilter = (name: string, value: string, isMulti: boolean = true) => {
        router.push(pathname + '?' + createQueryString(name, value, isMulti), { scroll: false });
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPriceRange(Number(e.target.value));
    };

    const applyPriceFilter = () => {
        router.push(pathname + '?' + createQueryString('maxPrice', priceRange.toString(), false), { scroll: false });
    };

    const clearFilters = () => {
        router.push(pathname, { scroll: false });
    };

    const activeFiltersCount = Array.from(searchParams.keys()).filter(k => k !== 'sort').length;
    const selectedCategories = getParamValues('category');
    const selectedColors = getParamValues('color');
    const selectedSizes = getParamValues('size');

    return (
        <>
            {/* Mobile Filter Toggle Button */}
            <div className="lg:hidden w-full mb-8">
                <button
                    onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                    className="w-full py-4 flex items-center justify-between px-6 bg-white border border-gray-100 shadow-sm rounded-none"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] uppercase tracking-[0.2em] font-black text-text-main-light">Filters & Sort</span>
                        {activeFiltersCount > 0 && (
                            <span className="bg-primary text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                {activeFiltersCount}
                            </span>
                        )}
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMobileFiltersOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            <aside className={`space-y-8 lg:space-y-10 sticky top-28 ${isMobileFiltersOpen ? 'block animate-in slide-in-from-top-4 duration-500' : 'hidden lg:block'}`}>
                <div className="hidden lg:flex items-center justify-between border-b border-gray-100 pb-4">
                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-text-main-light">Refine By</span>
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="text-[10px] uppercase tracking-widest text-primary underline underline-offset-4 font-bold"
                        >
                            Reset
                        </button>
                    )}
                </div>

                {/* Sub-Categories */}
                <div className="border-b border-gray-50 lg:border-none pb-6 lg:pb-0">
                    <button
                        onClick={() => toggleSection('category')}
                        className="flex justify-between items-center w-full mb-6 group"
                    >
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-main-light group-hover:text-primary transition-colors">Category</h3>
                        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${expandedSections.includes('category') ? 'rotate-180' : ''}`} />
                    </button>

                    {expandedSections.includes('category') && (
                        <ul className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            {categories.map((cat) => (
                                <li key={cat.id}>
                                    <button
                                        onClick={() => toggleFilter('category', cat.slug)}
                                        className={`text-[11px] flex justify-between items-center w-full uppercase tracking-[0.15em] transition-all group ${selectedCategories.includes(cat.slug) ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3.5 h-3.5 border border-gray-200 rounded-sm flex items-center justify-center transition-colors ${selectedCategories.includes(cat.slug) ? 'bg-primary border-primary' : 'group-hover:border-primary'
                                                }`}>
                                                {selectedCategories.includes(cat.slug) && <Check className="w-2 h-2 text-white" />}
                                            </div>
                                            <span>{cat.name}</span>
                                        </div>
                                        <span className="text-[9px] opacity-40 font-normal">({cat._count.products})</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Colors */}
                <div className="border-b border-gray-50 lg:border-none pb-6 lg:pb-0">
                    <button
                        onClick={() => toggleSection('colors')}
                        className="flex justify-between items-center w-full mb-6 group"
                    >
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-main-light group-hover:text-primary transition-colors">Colors</h3>
                        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${expandedSections.includes('colors') ? 'rotate-180' : ''}`} />
                    </button>

                    {expandedSections.includes('colors') && (
                        <div className="grid grid-cols-6 lg:grid-cols-5 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            {colors.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => toggleFilter('color', color.name)}
                                    title={color.name}
                                    className={`group relative w-7 h-7 rounded-full flex items-center justify-center transition-all ${selectedColors.includes(color.name)
                                        ? 'ring-1 ring-primary ring-offset-2'
                                        : 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-1'
                                        }`}
                                >
                                    <div
                                        className="w-full h-full rounded-full border border-gray-100 shadow-sm"
                                        style={{ backgroundColor: color.hex || '#ccc' }}
                                    />
                                    {selectedColors.includes(color.name) && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Check className={`w-3 h-3 ${color.name.toLowerCase() === 'white' ? 'text-black' : 'text-white'}`} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sizes */}
                <div className="border-b border-gray-50 lg:border-none pb-6 lg:pb-0">
                    <button
                        onClick={() => toggleSection('sizes')}
                        className="flex justify-between items-center w-full mb-6 group"
                    >
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-main-light group-hover:text-primary transition-colors">Sizes</h3>
                        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${expandedSections.includes('sizes') ? 'rotate-180' : ''}`} />
                    </button>

                    {expandedSections.includes('sizes') && (
                        <div className="grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => toggleFilter('size', size)}
                                    className={`py-3 text-[10px] border transition-all font-bold uppercase tracking-widest ${selectedSizes.includes(size)
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-gray-100 text-gray-500 hover:border-text-main-light hover:text-text-main-light'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Price Range */}
                <div className="pb-6 lg:pb-0">
                    <button
                        onClick={() => toggleSection('price')}
                        className="flex justify-between items-center w-full mb-6 group"
                    >
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-main-light group-hover:text-primary transition-colors">Price Range</h3>
                        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${expandedSections.includes('price') ? 'rotate-180' : ''}`} />
                    </button>

                    {expandedSections.includes('price') && (
                        <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] uppercase tracking-widest text-gray-400">Current Max:</span>
                                <span className="text-[11px] font-black text-primary tracking-widest">R {priceRange.toLocaleString()}</span>
                            </div>
                            <div className="px-1">
                                <input
                                    type="range"
                                    min="0"
                                    max={maxPrice}
                                    value={priceRange}
                                    onChange={handlePriceChange}
                                    onMouseUp={applyPriceFilter}
                                    onTouchEnd={applyPriceFilter}
                                    className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between mt-4 text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                                    <span>R 0</span>
                                    <span>R {maxPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Reset Button */}
                {activeFiltersCount > 0 && isMobileFiltersOpen && (
                    <button
                        onClick={clearFilters}
                        className="lg:hidden w-full py-4 text-[10px] uppercase tracking-widest bg-gray-50 text-text-main-light font-black border border-gray-100"
                    >
                        Clear All Filters
                    </button>
                )}
            </aside>
        </>
    );
}

export default function FilterSidebar(props: FilterSidebarProps) {
    return (
        <Suspense fallback={<div className="animate-pulse space-y-8">
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="space-y-4">
                <div className="h-3 bg-gray-50 rounded w-full"></div>
                <div className="h-3 bg-gray-50 rounded w-full"></div>
                <div className="h-3 bg-gray-50 rounded w-full"></div>
            </div>
        </div>}>
            <FilterSidebarContent {...props} />
        </Suspense>
    );
}
