'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Trophy, Leaf, ChevronRight, Quote } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen">
            <Header />

            {/* Cinematic Hero */}
            <header className="relative w-full h-[90vh] overflow-hidden group">
                <Image
                    alt="Socrati Official Heritage"
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[3s] ease-out"
                    src="https://images.unsplash.com/photo-1590247813693-5541d1c609fd?q=80&w=2600&auto=format&fit=crop"
                    fill
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
                    <span className="text-white/80 text-[10px] md:text-xs font-black uppercase tracking-[0.6em] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Since 1985
                    </span>
                    <h1 className="text-white text-6xl md:text-9xl font-serif mb-8 drop-shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        Our <span className="italic">Heritage</span>
                    </h1>
                    <div className="w-16 h-1 bg-white/30 rounded-full animate-in fade-in zoom-in duration-1000 delay-500"></div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/40">
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] rotate-90 mb-4">Explore</span>
                    <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent"></div>
                </div>
            </header>

            {/* The Legend Section */}
            <section className="py-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
                        <div className="lg:col-span-5 space-y-12 relative">
                            <div className="absolute -top-20 -left-10 text-[15rem] font-serif font-black text-gray-50 -z-10 select-none">S</div>
                            <h2 className="text-4xl md:text-6xl font-serif text-text-main-light leading-[1.1] tracking-tighter">
                                The Birth of a <span className="italic">Bespoke</span> Passion
                            </h2>
                            <div className="space-y-8 text-gray-500 font-light leading-relaxed text-lg">
                                <p>
                                    Founded in the heart of Milan's historic Quadrilatero della Moda, Socrati Official began as a whisper among the city's most discerning circles. What started in a small atelier in 1985 has evolved into a global symbol of unapologetic luxury.
                                </p>
                                <p className="font-medium text-text-main-light italic border-l-2 border-primary pl-6 py-2">
                                    "We don't just craft shoes; we curate the foundation of a woman's confidence."
                                </p>
                                <p>
                                    Every silhouette is a dialogue between traditional Italian mastery and the avant-garde spirit of modern femininity.
                                </p>
                            </div>
                        </div>
                        <div className="lg:col-span-7">
                            <div className="relative aspect-[16/10] rounded-[3rem] overflow-hidden shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-1000">
                                <Image
                                    alt="Master Craftsman"
                                    className="w-full h-full object-cover"
                                    src="https://images.unsplash.com/photo-1596462502278-27bfbe4033c1?q=80&w=2600&auto=format&fit=crop"
                                    fill
                                />
                                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Grid */}
            <section className="py-32 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-serif text-text-main-light mb-6 tracking-tight">Pillars of Excellence</h2>
                        <div className="w-12 h-0.5 bg-primary/20 mx-auto"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Master Craftsmanship',
                                description: 'Hand-stitched precision using centuries-old techniques refined for the modern age.',
                                icon: Sparkles,
                                color: 'bg-amber-50 text-amber-600'
                            },
                            {
                                title: 'Ethical Sourcing',
                                description: 'Only the highest grade, ethically certified Italian leathers touch our artisans hands.',
                                icon: Trophy,
                                color: 'bg-emerald-50 text-emerald-600'
                            },
                            {
                                title: 'Timeless Vision',
                                description: 'Pieces designed to transcend seasons, becoming heirlooms of personal style.',
                                icon: Leaf,
                                color: 'bg-blue-50 text-blue-600'
                            },
                        ].map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <div key={index} className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                                    <div className={`w-16 h-16 rounded-2xl ${value.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-serif text-text-main-light mb-4">{value.title}</h3>
                                    <p className="text-sm text-gray-500 font-light leading-relaxed">{value.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* The Atelier Section */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-text-main-light rounded-[4rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl relative">
                        <div className="lg:w-1/2 relative aspect-square lg:aspect-auto h-full min-h-[500px]">
                            <Image
                                alt="Secret Atelier"
                                className="w-full h-full object-cover opacity-80"
                                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop"
                                fill
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-text-main-light via-transparent to-transparent hidden lg:block"></div>
                        </div>
                        <div className="lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center space-y-10 text-white relative z-10">
                            <Quote className="w-16 h-16 text-primary/20 absolute top-12 right-12" />
                            <h2 className="text-4xl md:text-5xl font-serif italic leading-tight">
                                Where Silence Speaks <br />in Every Stitch
                            </h2>
                            <p className="text-white/70 font-light leading-relaxed text-lg">
                                Our Milanese atelier is more than a workshop; it is a sanctuary. Here, the hum of machinery is replaced by the focused silence of masters. Each pair of shoes takes over 48 hours of dedicated handwork to reach perfection.
                            </p>
                            <div className="pt-6">
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-4 bg-white text-text-main-light px-12 py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-500 group/btn"
                                >
                                    Visit the Sanctuary <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Boutique Invitation */}
            <section className="py-32 px-6 text-center">
                <div className="max-w-3xl mx-auto space-y-12">
                    <h2 className="text-4xl md:text-6xl font-serif text-text-main-light">An Eternal <span className="italic">Invite</span></h2>
                    <p className="text-gray-500 font-light leading-relaxed text-xl">
                        Become part of our inner circle. Discreetly receive news of private viewing events and early collection access.
                    </p>
                    <form className="relative max-w-lg mx-auto group">
                        <input
                            type="email"
                            placeholder="Your email for private invitations"
                            className="w-full bg-gray-50 border-b-2 border-gray-200 py-6 px-8 focus:outline-none focus:border-primary text-sm transition-all rounded-t-3xl"
                        />
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-text-main-light text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg"
                        >
                            Join
                        </button>
                    </form>
                </div>
            </section>

            <Footer />
        </div>
    );
}
