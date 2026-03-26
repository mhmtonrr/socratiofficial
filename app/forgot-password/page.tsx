'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setMessage('If an account exists with this email, a password reset link has been sent.');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to request password reset. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 px-4 py-20">
                <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-md w-full">
                    <h1 className="text-2xl font-serif font-bold text-text-main-light mb-2 text-center">Reset Password</h1>
                    <p className="text-sm text-gray-500 mb-8 text-center italic">Enter your email and we'll send you a link to reset your password.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {message && (
                            <div className="bg-green-50 border border-green-200 p-4 text-center">
                                <p className="text-green-700 text-[10px] uppercase font-bold tracking-widest">{message}</p>
                            </div>
                        )}
                        {error && (
                            <div className="bg-rose-50 border border-rose-100 p-4 text-center">
                                <p className="text-rose-600 text-[10px] uppercase font-bold tracking-widest">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs uppercase tracking-widest mb-3 font-medium text-text-main-light" htmlFor="email">Email Address *</label>
                            <input
                                className="w-full bg-transparent border border-gray-300 px-4 py-4 text-sm focus:outline-none focus:border-primary focus:ring-0 rounded-none text-text-main-light placeholder-gray-400"
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-text-main-light text-white px-8 py-5 uppercase text-[11px] tracking-[0.2em] font-bold hover:bg-primary transition-all duration-500 disabled:opacity-50"
                            type="submit"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link href="/login" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-primary transition-colors underline underline-offset-4">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
