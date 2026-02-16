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
        <aside className="space-y-10 sticky top-28">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-text-main-light">Filters</span>
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
            <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Category</h3>
                <ul className="space-y-3">
                    {categories.map((cat) => (
                        <li key={cat.id}>
                            <button
                                onClick={() => toggleFilter('category', cat.slug)}
                                className={`text-[11px] flex justify-between items-center w-full uppercase tracking-[0.15em] transition-all group ${selectedCategories.includes(cat.slug) ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 border border-gray-200 rounded-sm flex items-center justify-center transition-colors ${selectedCategories.includes(cat.slug) ? 'bg-primary border-primary' : 'group-hover:border-primary'
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
            </div>

            {/* Colors */}
            <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Colors</h3>
                <div className="grid grid-cols-6 gap-3">
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
            </div>

            {/* Sizes */}
            <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Sizes</h3>
                <div className="grid grid-cols-4 gap-2">
                    {sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => toggleFilter('size', size)}
                            className={`py-2 text-[10px] border transition-all font-medium uppercase tracking-widest ${selectedSizes.includes(size)
                                ? 'border-primary bg-primary text-white'
                                : 'border-gray-100 text-gray-500 hover:border-gray-300'
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-6 pt-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Price Range</h3>
                    <span className="text-[10px] font-bold text-primary tracking-widest">Up to R {priceRange.toLocaleString()}</span>
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
        </aside>
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
