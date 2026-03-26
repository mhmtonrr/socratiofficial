'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Trash2, Copy, AlertCircle, Link as LinkIcon, Download, Loader2, Search, Check } from 'lucide-react';
import Image from 'next/image';

type Media = {
    id: string;
    url: string;
    publicId: string | null;
    format: string | null;
    bytes: number | null;
    createdAt: string;
};

export default function MediaGalleryPage() {
    const [mediaList, setMediaList] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/media');
            const data = await res.json();
            if (res.ok) {
                setMediaList(data.media);
            } else {
                setError(data.error || 'Failed to fetch media');
            }
        } catch (error) {
            setError('Something went wrong');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this image? It will be removed from Cloudinary and all associated products might show broken links if still in use.')) return;
        
        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/media?id=${id}`, {
                method: 'DELETE',
            });
            
            if (res.ok) {
                setMediaList(prev => prev.filter(m => m.id !== id));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting image');
        } finally {
            setDeletingId(null);
        }
    };

    const handleCopyUrl = (url: string, id: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatBytes = (bytes?: number | null) => {
        if (!bytes) return 'Unknown size';
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const filteredMedia = mediaList.filter(m => 
        (m.publicId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.url.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading && mediaList.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-text-main-light mb-2 font-bold tracking-tight">Media Library</h1>
                    <p className="text-xs text-gray-400 uppercase tracking-[0.3em] font-black">Manage product assets and imagery</p>
                </div>
                
                <div className="relative w-full sm:w-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by ID or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary w-full sm:w-[300px] text-xs font-medium bg-white"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredMedia.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl bg-white/50">
                        <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-xs uppercase tracking-widest font-bold">No media found in the database.</p>
                        <p className="text-[10px] uppercase font-medium mt-2">Upload images via product creation to populate this gallery.</p>
                    </div>
                ) : (
                    filteredMedia.map((media) => (
                        <div key={media.id} className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            {/* Image Preview */}
                            <div className="relative aspect-square w-full bg-gray-50 flexitems-center justify-center overflow-hidden">
                                <Image
                                    src={media.url}
                                    alt="Media File"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                    <button 
                                        onClick={() => handleCopyUrl(media.url, media.id)}
                                        className="w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                                        title="Copy URL"
                                    >
                                        {copiedId === media.id ? <Check className="w-4 h-4 text-emerald-300" /> : <LinkIcon className="w-4 h-4" />}
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(media.id)}
                                        disabled={deletingId === media.id}
                                        className="w-10 h-10 bg-rose-500/80 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg disabled:opacity-50"
                                        title="Delete Image"
                                    >
                                        {deletingId === media.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Meta Info */}
                            <div className="p-4 border-t border-gray-50 flex flex-col justify-between">
                                <div className="truncate text-xs font-bold text-text-main-light mb-1 line-clamp-1" title={media.publicId || media.id}>
                                    {media.publicId ? media.publicId.split('/').pop() : 'Direct Upload'}
                                </div>
                                <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                    <span>{media.format?.toUpperCase() || 'IMG'}</span>
                                    <span>{formatBytes(media.bytes)}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
