'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (!token) {
            setError('Missing password reset token. Please request a new link.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (@$!%*?&#)');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Your password has been successfully reset. Redirecting to login...');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setError(data.error || 'Failed to reset password. The link might be expired.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-md w-full">
            <h1 className="text-2xl font-serif font-bold text-text-main-light mb-2 text-center">Set New Password</h1>
            <p className="text-sm text-gray-500 mb-8 text-center italic">Please enter your new password below.</p>

            {message && (
                <div className="bg-green-50 border border-green-200 p-4 text-center mb-6">
                    <p className="text-green-700 text-[10px] uppercase font-bold tracking-widest">{message}</p>
                </div>
            )}
            {error && (
                <div className="bg-rose-50 border border-rose-100 p-4 text-center mb-6">
                    <p className="text-rose-600 text-[10px] uppercase font-bold tracking-widest">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs uppercase tracking-widest mb-3 font-medium text-text-main-light" htmlFor="password">New Password *</label>
                    <input
                        className="w-full bg-transparent border border-gray-300 px-4 py-4 text-sm focus:outline-none focus:border-primary focus:ring-0 rounded-none text-text-main-light placeholder-gray-400"
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-widest mb-3 font-medium text-text-main-light" htmlFor="confirmPassword">Confirm Password *</label>
                    <input
                        className="w-full bg-transparent border border-gray-300 px-4 py-4 text-sm focus:outline-none focus:border-primary focus:ring-0 rounded-none text-text-main-light placeholder-gray-400"
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />
                </div>

                <button
                    disabled={loading || !!message}
                    className="w-full bg-text-main-light text-white px-8 py-5 uppercase text-[11px] tracking-[0.2em] font-bold hover:bg-primary transition-all duration-500 disabled:opacity-50"
                    type="submit"
                >
                    {loading ? 'Saving...' : 'Reset Password'}
                </button>
            </form>

            <div className="mt-8 text-center">
                <Link href="/login" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-primary transition-colors underline underline-offset-4">
                    Back to Login
                </Link>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <>
            <Header />
            <main className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 px-4 py-20">
                <Suspense fallback={
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                }>
                    <ResetPasswordForm />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
