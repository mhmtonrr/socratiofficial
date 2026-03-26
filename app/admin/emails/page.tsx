'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Search, Eye, Filter, RefreshCcw } from 'lucide-react';

export default function EmailLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmail, setSelectedEmail] = useState<any>(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/emails');
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-4xl font-serif italic text-text-main-light mb-2">Email Notifications</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">System Communication Audit Log</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right px-6 border-r border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Sent</p>
                        <p className="text-2xl font-serif italic text-text-main-light">{logs.length}</p>
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="w-12 h-12 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-2xl hover:bg-black hover:text-white transition-all group"
                        title="Refresh Logs"
                    >
                        <RefreshCcw className={`w-5 h-5 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden translate-y-0 opacity-100 transition-all duration-700">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Recipient or Subject..."
                            className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-gray-100 focus:outline-none focus:ring-4 focus:ring-black/5 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100/50">
                            Showing {filteredLogs.length} Records
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/30">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-100">Recipient</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-100">Subject</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-100">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-100">Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-8"><div className="h-4 bg-gray-100 rounded w-full opacity-50"></div></td>
                                    </tr>
                                ))
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="max-w-xs mx-auto space-y-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                                                <Search className="text-gray-200 w-8 h-8" />
                                            </div>
                                            <p className="text-sm font-light text-gray-400 italic">No communication records matched your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-text-main-light">{log.to}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm text-gray-500 font-light">{log.subject}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                                                log.status === 'SENT' 
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' 
                                                : 'bg-rose-50 text-rose-600 border-rose-100/50'
                                            }`}>
                                                {log.status === 'SENT' ? (
                                                    <CheckCircle2 className="w-3 h-3" />
                                                ) : (
                                                    <AlertCircle className="w-3 h-3" />
                                                )}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{log.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[11px] font-medium tracking-tighter uppercase">{new Date(log.createdAt).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => setSelectedEmail(log)}
                                                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all hover:-translate-y-0.5"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for detail */}
            {selectedEmail && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 bg-gray-50/50 border-b border-gray-100 flex justify-between items-start">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        selectedEmail.status === 'SENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                        {selectedEmail.status}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        {new Date(selectedEmail.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-serif italic text-text-main-light leading-tight">{selectedEmail.subject}</h3>
                                <p className="text-sm font-medium text-primary">To: {selectedEmail.to}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedEmail(null)}
                                className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-gray-400 hover:text-black hover:shadow-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-10 bg-white">
                            {selectedEmail.error && (
                                <div className="mb-10 p-6 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-rose-600">
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="text-xs font-black uppercase tracking-widest">Delivery Failure Reason</span>
                                    </div>
                                    <p className="text-sm text-rose-800 font-mono italic">{selectedEmail.error}</p>
                                </div>
                            )}

                            <div className="border border-gray-100 rounded-3xl p-8 bg-white shadow-inner">
                                <div 
                                    className="prose prose-sm max-w-none email-preview"
                                    dangerouslySetInnerHTML={{ __html: selectedEmail.body }} 
                                />
                            </div>
                        </div>
                        
                        <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex justify-end gap-3">
                             <button
                                onClick={() => setSelectedEmail(null)}
                                className="px-8 py-4 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-lg shadow-black/10"
                             >
                                Close Audit
                             </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const X = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);
