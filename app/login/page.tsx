'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Check } from 'lucide-react';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    // Login State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [loginLoading, setLoginLoading] = useState(false);

    // Register State
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regFirstName, setRegFirstName] = useState('');
    const [regLastName, setRegLastName] = useState('');
    const [regErrors, setRegErrors] = useState<{ email?: string; password?: string; firstName?: string; lastName?: string; general?: string }>({});
    const [regLoading, setRegLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginErrors({});

        // Simple validation
        const errors: any = {};
        if (!loginEmail) errors.email = 'Email is required';
        if (!loginPassword) errors.password = 'Password is required';

        if (Object.keys(errors).length > 0) {
            setLoginErrors(errors);
            setLoginLoading(false);
            return;
        }

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: loginEmail,
                password: loginPassword,
            });

            if (result?.error) {
                // Determine a more user-friendly error message
                let errorMsg = 'Invalid email or password';
                
                // If NextAuth returns the specific text we throw in lib/auth.ts, use it
                if (result.error !== 'CredentialsSignin') {
                    errorMsg = result.error;
                }
                
                setLoginErrors({ general: errorMsg });
            } else {
                router.push(redirectTo);
                router.refresh();
            }
        } catch (error) {
            setLoginErrors({ general: 'An unexpected error occurred' });
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegLoading(true);
        setRegErrors({});

        // Robust Validation
        const errors: any = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;

        if (!regFirstName.trim()) errors.firstName = 'First name is required';
        else if (!nameRegex.test(regFirstName)) errors.firstName = 'Only letters allowed';

        if (!regLastName.trim()) errors.lastName = 'Last name is required';
        else if (!nameRegex.test(regLastName)) errors.lastName = 'Only letters allowed';

        if (!regEmail.trim()) errors.email = 'Email address is required';
        else if (!emailRegex.test(regEmail)) errors.email = 'Please enter a valid email address';

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!regPassword) {
            errors.password = 'Password is required';
        } else if (!passwordRegex.test(regPassword)) {
            errors.password = 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (@$!%*?&#)';
        }

        if (Object.keys(errors).length > 0) {
            setRegErrors(errors);
            setRegLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: regEmail,
                    password: regPassword,
                    firstName: regFirstName,
                    lastName: regLastName,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setRegErrors({ general: data.error || 'Registration failed' });
            } else {
                // Removed auto sign-in since user needs verification
                setSuccessMessage('Account created! Please check your email to verify your account before logging in.');
            }
        } catch (error) {
            setRegErrors({ general: 'An unexpected error occurred' });
        } finally {
            setRegLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main className="bg-white min-h-screen py-20">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8">
                    <h1 className="text-4xl font-serif text-text-main-light mb-16 text-center tracking-tight">Account</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
                        {/* Login Form */}
                        <div className="md:pr-12 md:border-r md:border-gray-100">
                            <h2 className="text-xl font-serif text-text-main-light mb-8">Registered Customers</h2>
                            <form onSubmit={handleLogin} className="space-y-6">
                                {loginErrors.general && (
                                    <div className="bg-rose-50 border border-rose-100 p-4 animate-in fade-in slide-in-from-top-1 duration-300">
                                        <p className="text-rose-600 text-[10px] uppercase font-bold tracking-widest">{loginErrors.general}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs uppercase tracking-widest mb-3 font-medium text-text-main-light" htmlFor="email">Email Address *</label>
                                    <input
                                        className={`w-full bg-transparent border ${loginErrors.email ? 'border-rose-500' : 'border-gray-300'} px-4 py-4 text-sm focus:outline-none focus:border-primary focus:ring-0 rounded-none text-text-main-light placeholder-gray-400 transition-colors`}
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                    />
                                    {loginErrors.email && <p className="text-rose-500 text-[9px] uppercase tracking-widest mt-2 italic">{loginErrors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest mb-3 font-medium text-text-main-light" htmlFor="password">Password *</label>
                                    <input
                                        className={`w-full bg-transparent border ${loginErrors.password ? 'border-rose-500' : 'border-gray-300'} px-4 py-4 text-sm focus:outline-none focus:border-primary focus:ring-0 rounded-none text-text-main-light placeholder-gray-400 transition-colors`}
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                    />
                                    {loginErrors.password && <p className="text-rose-500 text-[9px] uppercase tracking-widest mt-2 italic">{loginErrors.password}</p>}
                                </div>
                                <div className="flex items-center justify-between">
                                    <Link href="/forgot-password" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-primary transition-colors underline underline-offset-4">Forgot your password?</Link>
                                </div>
                                <button
                                    disabled={loginLoading}
                                    className="w-full mt-4 bg-text-main-light text-white px-8 py-5 uppercase text-[11px] tracking-[0.2em] font-bold hover:bg-primary transition-all duration-500 disabled:opacity-50"
                                    type="submit"
                                >
                                    {loginLoading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </form>
                        </div>

                        {/* Register Form */}
                        <div className="md:pl-4">
                            <h2 className="text-xl font-serif text-text-main-light mb-8">New Customer</h2>
                            <p className="text-sm text-gray-500 font-light leading-relaxed mb-8 italic">Creating an account has many benefits: check out faster, keep more than one address, track orders and more.</p>

                            <form onSubmit={handleRegister} className="space-y-6">
                                {successMessage && (
                                    <div className="bg-green-50 border border-green-200 p-4 animate-in fade-in slide-in-from-top-1 duration-300 flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-green-700 text-[10px] uppercase font-bold tracking-widest">{successMessage}</p>
                                            {successMessage.includes('signed in') && (
                                                <p className="text-green-500 text-[9px] mt-1 tracking-widest">Redirecting you to the home page...</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {regErrors.general && (
                                    <div className="bg-rose-50 border border-rose-100 p-4 animate-in fade-in slide-in-from-top-1 duration-300">
                                        <p className="text-rose-600 text-[10px] uppercase font-bold tracking-widest">{regErrors.general}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest mb-3 font-medium text-text-main-light" htmlFor="reg-first-name">First Name *</label>
                                        <input
                                            className={`w-full bg-transparent border ${regErrors.firstName ? 'border-rose-500' : 'border-gray-300'} px-4 py-4 text-sm focus:outline-none focus:border-primary focus:ring-0 rounded-none text-text-main-light placeholder-gray-400 transition-colors`}
                                            id="reg-first-name"
                                            type="text"
                                            placeholder="First Name"
                                            value={regFirstName}
                                            onChange={(e) => setRegFirstName(e.target.value)}
                                        />
                                        {regErrors.firstName && <p className="text-rose-500 text-[9px] uppercase tracking-widest mt-2">{regErrors.firstName}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest mb-3 font-medium text-text-main-light" htmlFor="reg-last-name">Last Name *</label>
                                        <input
                                            className={`w-full bg-transparent border ${regErrors.lastName ? 'border-rose-500' : 'border-gray-300'} px-4 py-4 text-sm focus:outline-none focus:border-primary focus:ring-0 rounded-none text-text-main-light placeholder-gray-400 transition-colors`}
                                            id="reg-last-name"
                                            type="text"
                                            placeholder="Last Name"
                                            value={regLastName}
                                            onChange={(e) => setRegLastName(e.target.value)}
                                        />
                                        {regErrors.lastName && <p className="text-rose-500 text-[9px] uppercase tracking-widest mt-2">{regErrors.lastName}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest mb-3 font-medium text-text-main-light" htmlFor="reg-email">Email Address *</label>
                                    <input
                                        className={`w-full bg-transparent border ${regErrors.email ? 'border-rose-500' : 'border-gray-300'} px-4 py-4 text-sm focus:outline-none focus:border-primary focus:ring-0 rounded-none text-text-main-light placeholder-gray-400 transition-colors`}
                                        id="reg-email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                    />
                                    {regErrors.email && <p className="text-rose-500 text-[9px] uppercase tracking-widest mt-2">{regErrors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest mb-3 font-medium text-text-main-light" htmlFor="reg-password">Password *</label>
                                    <input
                                        className={`w-full bg-transparent border ${regErrors.password ? 'border-rose-500' : 'border-gray-300'} px-4 py-4 text-sm focus:outline-none focus:border-primary focus:ring-0 rounded-none text-text-main-light placeholder-gray-400 transition-colors`}
                                        id="reg-password"
                                        type="password"
                                        placeholder="Min. 8 chars, uppercase, lowercase, number & symbol"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                    />
                                    {regErrors.password && <p className="text-rose-500 text-[9px] uppercase tracking-widest mt-2 leading-relaxed">{regErrors.password}</p>}
                                </div>
                                <button
                                    disabled={regLoading}
                                    className="w-full mt-4 bg-transparent border border-text-main-light text-text-main-light px-8 py-5 uppercase text-[11px] tracking-[0.2em] font-bold hover:bg-text-main-light hover:text-white transition-all duration-500 disabled:opacity-50"
                                    type="submit"
                                >
                                    {regLoading ? 'Creating...' : 'Create Account'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <>
                <Header />
                <div className="min-h-screen bg-white flex items-center justify-center">
                    <div className="animate-pulse text-[10px] uppercase tracking-widest text-gray-400">Loading...</div>
                </div>
                <Footer />
            </>
        }>
            <LoginContent />
        </Suspense>
    );
}
