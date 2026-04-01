
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function UserProfilePage() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });

    useEffect(() => {
        if (session?.user) {
            const [firstName, ...lastNameParts] = session.user.name?.split(' ') || ['', ''];
            setFormData({
                firstName,
                lastName: lastNameParts.join(' '),
                email: session.user.email || '',
            });
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                await update({ name: `${formData.firstName} ${formData.lastName}` });
                alert('Your information has been successfully updated.');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordMessage('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(passwordData.newPassword)) {
            setPasswordError('Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (@$!%*?&#)');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/user/password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setPasswordMessage('Password updated successfully.');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setIsChangingPassword(false), 3000);
            } else {
                setPasswordError(data.error || 'Failed to update password.');
            }
        } catch (error) {
            setPasswordError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-12">
            <div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-8 pb-4 border-b border-gray-100 italic">Profile Details</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-xs font-medium focus:border-primary outline-none transition-all"
                                placeholder="Your first name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-xs font-medium focus:border-primary outline-none transition-all"
                                placeholder="Your last name"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-lg text-xs font-medium text-gray-400 cursor-not-allowed"
                        />
                        <p className="text-[9px] text-gray-400 italic">Email address cannot be changed.</p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-white px-10 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                        >
                            {loading ? 'Updating...' : <><Save className="w-3 h-3" /> Update Information</>}
                        </button>
                    </div>
                </form>
            </div>

            <div className="pt-12 border-t border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Security</h3>
                <p className="text-xs text-gray-500 mb-6">We recommend updating your password periodically for account security.</p>
                
                {!isChangingPassword ? (
                    <button 
                        onClick={() => setIsChangingPassword(true)}
                        className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 px-6 py-2 rounded-lg hover:bg-primary hover:text-white transition-all"
                    >
                        Change Password
                    </button>
                ) : (
                    <form onSubmit={handlePasswordChange} className="bg-gray-50 p-6 rounded-2xl space-y-4 max-w-md animate-in fade-in slide-in-from-top-2 duration-300">
                        {passwordMessage && <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-2 bg-green-50 p-2 border border-green-100">{passwordMessage}</p>}
                        {passwordError && <p className="text-[10px] text-rose-600 font-bold uppercase tracking-widest mb-2 bg-rose-50 p-2 border border-rose-100 italic">{passwordError}</p>}
                        
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Current Password</label>
                            <input
                                type="password"
                                required
                                value={passwordData.currentPassword}
                                onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary"
                                placeholder="Enter current password"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">New Password</label>
                            <input
                                type="password"
                                required
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary"
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                value={passwordData.confirmPassword}
                                onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary"
                                placeholder="Repeat new password"
                            />
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-text-main-light text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
                            >
                                {loading ? 'Saving...' : 'Save New Password'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsChangingPassword(false)}
                                className="text-gray-400 px-4 py-2 text-[10px] uppercase font-bold tracking-widest hover:text-red-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
