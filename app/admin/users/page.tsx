
'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Shield,
    User as UserIcon,
    Mail,
    Calendar,
    ShoppingBag,
    MoreVertical,
    Trash2,
    ShieldCheck,
    ShieldAlert,
    ChevronRight,
    Filter
} from 'lucide-react';

type User = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: 'USER' | 'ADMIN';
    createdAt: string;
    _count: {
        orders: number;
    };
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (res.ok) setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (user: User) => {
        const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
        if (!confirm(`Switch ${user.email} to ${newRole} role?`)) return;

        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, role: newRole }),
            });
            if (res.ok) fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-black text-text-main-light mb-2 tracking-tight flex items-center gap-4">
                        <Users className="w-8 h-8 text-primary" /> Artisanal Community
                    </h1>
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-black">Managing the custodians of the Socrati legacy</p>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                    {(['ALL', 'ADMIN', 'USER'] as const).map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${roleFilter === role
                                ? 'bg-[#1A1A1A] text-white shadow-lg shadow-black/10'
                                : 'text-gray-400 hover:text-text-main-light'
                                }`}
                        >
                            {role === 'ALL' ? 'Everyone' : role === 'ADMIN' ? 'Atelier Curators' : 'Elite Members'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Dashboard Snippet */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 flex items-center gap-6 shadow-sm group hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Members</p>
                        <p className="text-2xl font-serif font-black text-text-main-light">{users.length}</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 flex items-center gap-6 shadow-sm group hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Privileged Access</p>
                        <p className="text-2xl font-serif font-black text-text-main-light">{users.filter(u => u.role === 'ADMIN').length}</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 flex items-center gap-6 shadow-sm group hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Patrons</p>
                        <p className="text-2xl font-serif font-black text-text-main-light">{users.filter(u => u._count.orders > 0).length}</p>
                    </div>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search by identity or email address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-transparent bg-gray-50/50 text-xs font-medium focus:bg-white focus:border-primary/10 outline-none transition-all placeholder:text-gray-300"
                    />
                </div>
            </div>

            {/* Users Directory */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Identity</th>
                                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Communication</th>
                                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Privilege Level</th>
                                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Legacy Status</th>
                                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Authenticating Directory...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-24 text-center">
                                        <p className="text-xs font-serif italic text-gray-400">No identities match your current criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/30 transition-all group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500">
                                                    <UserIcon className="w-6 h-6 text-gray-300" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-text-main-light mb-0.5">{user.firstName} {user.lastName}</div>
                                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" /> Since {new Date(user.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2 text-xs font-medium text-text-main-light">
                                                <Mail className="w-3.5 h-3.5 text-gray-300" /> {user.email}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${user.role === 'ADMIN'
                                                ? 'bg-primary/5 text-primary border-primary/10 shadow-[0_4px_12px_rgba(var(--primary-rgb),0.1)]'
                                                : 'bg-gray-50 text-gray-400 border-gray-100'
                                                }`}>
                                                {user.role === 'ADMIN' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                                {user.role === 'ADMIN' ? 'Atelier Curator' : 'Elite Member'}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <ShoppingBag className="w-3.5 h-3.5 text-gray-300" />
                                                    <span className="text-[10px] font-black text-text-main-light tabular-nums">{user._count.orders} Purchase{user._count.orders !== 1 && 's'}</span>
                                                </div>
                                                <div className="w-24 h-1 bg-gray-50 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-1000"
                                                        style={{ width: `${Math.min(user._count.orders * 10, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => toggleRole(user)}
                                                    className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary hover:border-primary/20 hover:shadow-lg transition-all"
                                                    title="Change privilege level"
                                                >
                                                    {user.role === 'ADMIN' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                                </button>
                                                <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-rose-500 hover:border-rose-100 hover:shadow-lg transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium Pagination Mock */}
            <div className="flex items-center justify-between px-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Displaying {filteredUsers.length} elite identities</p>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-300 cursor-not-allowed">Previous Evolution</button>
                    <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-main-light hover:border-primary/20 hover:text-primary transition-colors">Next Sequence</button>
                </div>
            </div>
        </div>
    );
}
