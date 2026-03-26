'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Check, X, Star, MessageSquare, Trash2, Edit, Save, ShieldCheck, ShieldAlert } from 'lucide-react';

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    isApproved: boolean;
    adminReply: string | null;
    createdAt: string;
    product: {
        name: string;
        images: { url: string }[];
    };
    user: {
        firstName: string | null;
        lastName: string | null;
        email: string;
    };
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/admin/reviews');
            const data = await res.json();
            setReviews(data);
        } catch (error) {
            console.error("Fetch reviews error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'unapprove' | 'delete', skipConfirmation = false) => {
        if (!skipConfirmation && action === 'delete' && !confirm('Are you sure you want to delete this review?')) return;
        
        try {
            if (action === 'delete') {
                const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
                if (res.ok) setReviews(reviews.filter(r => r.id !== id));
            } else {
                const res = await fetch(`/api/admin/reviews/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action })
                });
                if (res.ok) {
                    setReviews(reviews.map(r => r.id === id ? { ...r, isApproved: action === 'approve' } : r));
                }
            }
        } catch (error) {
            console.error(action + " error:", error);
        }
    };

    const handleReply = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/reviews/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reply', adminReply: replyText })
            });
            if (res.ok) {
                setReviews(reviews.map(r => r.id === id ? { ...r, adminReply: replyText } : r));
                setReplyingTo(null);
                setReplyText("");
            }
        } catch (error) {
            console.error("Reply error:", error);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-3 h-3 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} `} />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-black text-text-main-light mb-2 tracking-tight">Client Reviews</h1>
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-black">Moderate Collection Feedback</p>
                </div>
            </div>

            {/* Content List */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="p-8 space-y-8">
                    {loading ? (
                        <div className="py-24 text-center">
                            <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Client Testimonials...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="py-24 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No reviews found.</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="p-6 rounded-3xl bg-gray-50/50 border border-gray-100 flex flex-col md:flex-row gap-6 relative group">
                                
                                {/* Status Indicator */}
                                <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-black flex items-center gap-1.5 ${review.isApproved ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                    {review.isApproved ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                                    {review.isApproved ? 'Approved' : 'Pending Review'}
                                </div>

                                {/* User & Product Info */}
                                <div className="md:w-64 flex-shrink-0 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif font-bold text-lg overflow-hidden relative">
                                            {review.user.firstName ? review.user.firstName.charAt(0) : review.user.email.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-text-main-light">{review.user.firstName || 'Client'} {review.user.lastName || ''}</p>
                                            <p className="text-[10px] text-gray-400">{review.user.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                                        <div className="w-10 h-10 rounded-lg bg-white relative overflow-hidden border border-gray-100">
                                            {review.product.images[0] && (
                                                <Image src={review.product.images[0].url} alt={review.product.name} fill className="object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Reviewed Product</p>
                                            <p className="text-[11px] font-black text-primary/80 truncate w-32">{review.product.name}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Review Content & Actions */}
                                <div className="flex-grow space-y-4">
                                    <div>
                                        {renderStars(review.rating)}
                                        <p className="text-gray-600 text-sm font-medium leading-relaxed mt-2 italic">&quot;{review.comment || 'No written comment'}&quot;</p>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-400 mt-2 font-black">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>

                                    {/* Admin Reply Area */}
                                    {review.adminReply && replyingTo !== review.id && (
                                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mt-4 relative">
                                            <p className="text-[9px] uppercase tracking-widest text-primary font-black mb-1">Maison Socrati Reply:</p>
                                            <p className="text-xs font-medium text-text-main-light">{review.adminReply}</p>
                                            <button 
                                                onClick={() => { setReplyingTo(review.id); setReplyText(review.adminReply || ""); }}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-primary transition-colors"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    {replyingTo === review.id && (
                                        <div className="mt-4 space-y-3">
                                            <textarea 
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                className="w-full bg-white border border-primary/20 rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all min-h-[80px]"
                                                placeholder="Write your official reply here..."
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setReplyingTo(null)} className="px-4 py-2 text-[10px] uppercase tracking-widest font-black text-gray-400 hover:text-text-main-light transition-colors">Cancel</button>
                                                <button onClick={() => handleReply(review.id)} className="px-5 py-2 bg-primary text-white rounded-lg text-[10px] uppercase tracking-widest font-black flex items-center gap-2 hover:bg-text-main-light transition-colors">
                                                    <Save className="w-3 h-3" /> Save Reply
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
                                        {!review.isApproved ? (
                                            <button onClick={() => handleAction(review.id, 'approve', true)} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                                                <Check className="w-3 h-3" /> Approve
                                            </button>
                                        ) : (
                                            <button onClick={() => handleAction(review.id, 'unapprove', true)} className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                                                <X className="w-3 h-3" /> Reject
                                            </button>
                                        )}
                                        
                                        {!review.adminReply && replyingTo !== review.id && (
                                            <button onClick={() => { setReplyingTo(review.id); setReplyText(""); }} className="px-4 py-2 bg-primary/5 text-primary rounded-xl hover:bg-primary/10 transition-colors text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                                                <MessageSquare className="w-3 h-3" /> Reply
                                            </button>
                                        )}

                                        <button onClick={() => handleAction(review.id, 'delete')} className="px-4 py-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-colors text-[10px] uppercase font-black tracking-widest flex items-center gap-2 ml-auto">
                                            <Trash2 className="w-3 h-3" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
