'use client';

import { useState, useEffect } from 'react';
import { X, Search, Image as ImageIcon, Check } from 'lucide-react';
import Image from 'next/image';

interface Media {
    id: string;
    url: string;
    publicId: string | null;
}

export default function MediaPickerModal({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (url: string) => void }) {
    const [mediaList, setMediaList] = useState<Media[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetch('/api/admin/media')
                .then(res => res.json())
                .then(data => {
                    if (data.media) setMediaList(data.media);
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filtered = mediaList.filter(m => (m.publicId || '').toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-serif font-bold text-text-main-light">Select Media</h2>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">Choose an image from your library</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 flex justify-center flex-col items-center">
                            <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-xs uppercase font-bold tracking-widest">No media found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filtered.map(media => (
                                <div
                                    key={media.id}
                                    onClick={() => {
                                        onSelect(media.url);
                                        onClose();
                                    }}
                                    className="group relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:border-primary cursor-pointer transition-all"
                                >
                                    <Image src={media.url} alt="Media" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors flex items-center justify-center backdrop-blur-[1px] opacity-0 group-hover:opacity-100">
                                        <div className="bg-white text-primary px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                                            <Check className="w-3 h-3" /> Select
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
