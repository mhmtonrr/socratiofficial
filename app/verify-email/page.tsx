import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CheckCircle2, XCircle } from 'lucide-react';

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
    const params = await searchParams;
    const token = params.token;
    
    let success = false;
    let message = 'Invalid or missing verification token.';

    if (token) {
        const user = await prisma.user.findUnique({
            where: { verificationToken: token }
        });

        if (!user) {
            message = 'Invalid verification link. It may have expired or already been used.';
        } else if (user.verificationTokenExp && user.verificationTokenExp < new Date()) {
            message = 'This verification link has expired. Please request a new one by logging in.';
        } else {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    isVerified: true,
                    verificationToken: null,
                    verificationTokenExp: null
                }
            });
            success = true;
            message = 'Your email address has been successfully verified!';
        }
    }

    return (
        <>
            <Header />
            <main className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-md w-full text-center">
                    {success ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h1 className="text-2xl font-serif font-bold text-text-main-light">Email Verified</h1>
                            <p className="text-sm text-gray-500 mb-8">{message}</p>
                            <Link href="/login" className="bg-text-main-light text-white px-8 py-4 uppercase text-[11px] tracking-[0.2em] font-bold hover:bg-primary transition-all w-full text-center block">
                                Continue to Login
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-2">
                                <XCircle className="w-8 h-8" />
                            </div>
                            <h1 className="text-2xl font-serif font-bold text-text-main-light">Verification Failed</h1>
                            <p className="text-sm text-gray-500 mb-8">{message}</p>
                            <Link href="/login" className="border border-gray-200 text-gray-600 px-8 py-4 uppercase text-[11px] tracking-[0.2em] font-bold hover:bg-gray-50 transition-all w-full text-center block">
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
