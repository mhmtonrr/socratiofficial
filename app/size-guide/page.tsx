'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ruler, Info, CheckCircle, ArrowRight } from 'lucide-react';

export default function SizeGuidePage() {
    return (
        <div className="bg-white min-h-screen">
            <Header />

            {/* Premium Header */}
            <header className="relative py-24 md:py-32 overflow-hidden bg-gray-50 border-b border-gray-100">
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                    <Ruler className="w-[40vw] h-[40vw] -rotate-12" />
                </div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-serif text-text-main-light mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        The Perfect <span className="italic">Fit</span>
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed uppercase tracking-[0.3em] animate-in fade-in slide-in-from-bottom-2 duration-700">
                        Artisanal Precision for Comfort
                    </p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                    {/* Women's Table */}
                    <section className="space-y-10 group">
                        <div className="flex items-center gap-6 border-b border-gray-100 pb-6 transition-colors group-hover:border-primary/20">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary bg-primary/5 px-4 py-2 rounded-full">Collection</span>
                            <h2 className="text-3xl font-serif text-text-main-light">Women's Footwear</h2>
                        </div>
                        <div className="overflow-hidden rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <tr>
                                        <th className="py-6 px-8">EU SIZE</th>
                                        <th className="py-6 px-8">UK</th>
                                        <th className="py-6 px-8">US</th>
                                        <th className="py-6 px-8">LENGTH (CM)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-text-main-light font-medium tabular-nums divide-y divide-gray-50">
                                    {[
                                        ['36', '3', '5', '22.5'],
                                        ['37', '4', '6', '23.2'],
                                        ['38', '5', '7', '24.0'],
                                        ['39', '6', '8', '24.7'],
                                        ['40', '7', '9', '25.5'],
                                        ['41', '8', '10', '26.2']
                                    ].map((row, idx) => (
                                        <tr key={idx} className="hover:bg-primary/5 transition-colors cursor-default group/row">
                                            {row.map((cell, cidx) => (
                                                <td key={cidx} className="py-5 px-8 group-hover/row:text-primary transition-colors">{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Men's Table */}
                    <section className="space-y-10 group">
                        <div className="flex items-center gap-6 border-b border-gray-100 pb-6 transition-colors group-hover:border-primary/20">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 bg-blue-50 px-4 py-2 rounded-full">Collection</span>
                            <h2 className="text-3xl font-serif text-text-main-light">Men's Footwear</h2>
                        </div>
                        <div className="overflow-hidden rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <tr>
                                        <th className="py-6 px-8">EU SIZE</th>
                                        <th className="py-6 px-8">UK</th>
                                        <th className="py-6 px-8">US</th>
                                        <th className="py-6 px-8">LENGTH (CM)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-text-main-light font-medium tabular-nums divide-y divide-gray-50">
                                    {[
                                        ['40', '6.5', '7.5', '25.4'],
                                        ['41', '7.5', '8.5', '26.2'],
                                        ['42', '8.5', '9.5', '27.1'],
                                        ['43', '9.5', '10.5', '27.9'],
                                        ['44', '10.5', '11.5', '28.8'],
                                        ['45', '11.5', '12.5', '29.6']
                                    ].map((row, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors cursor-default group/row">
                                            {row.map((cell, cidx) => (
                                                <td key={cidx} className="py-5 px-8 group-hover/row:text-blue-600 transition-colors">{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Measurement Experience */}
                <section className="mt-32">
                    <div className="bg-text-main-light rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
                            <Info className="w-64 h-64 rotate-12" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10">
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-serif italic text-primary">Mastering the Measure</h3>
                                    <p className="text-white/60 font-light leading-relaxed">Follow our specialist guide to ensure your Socrati selection fits like a second skin.</p>
                                </div>
                                <div className="space-y-6">
                                    {[
                                        "Place a sheet of paper flush against a wall.",
                                        "Stand with your heel touching the wall boundary.",
                                        "Mark the longest part of your foot (heel-to-toe).",
                                        "Measure the distance in centimeters with precision.",
                                        "Align with our boutique tables above."
                                    ].map((step, idx) => (
                                        <div key={idx} className="flex items-center gap-6 group">
                                            <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-black group-hover:bg-primary group-hover:border-primary transition-all transition-transform duration-500">{idx + 1}</span>
                                            <p className="text-sm font-light text-white/80">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-12 border border-white/10 flex flex-col justify-center space-y-10">
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Atelier Advice</h4>
                                <div className="space-y-8">
                                    <div className="flex gap-6">
                                        <CheckCircle className="w-6 h-6 text-primary shrink-0" />
                                        <p className="text-sm text-white/70 leading-relaxed"><strong className="text-white">Between choices?</strong> We suggest selecting the larger size for the most refined comfort experience.</p>
                                    </div>
                                    <div className="flex gap-6">
                                        <CheckCircle className="w-6 h-6 text-primary shrink-0" />
                                        <p className="text-sm text-white/70 leading-relaxed"><strong className="text-white">The Living Leather:</strong> Our artisanal leathers are alive; they will mold to your unique form over time.</p>
                                    </div>
                                </div>
                                <div className="pt-6">
                                    <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white hover:text-primary transition-colors group">
                                        Download PDF Guide <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
