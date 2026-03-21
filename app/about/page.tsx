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
                    alt="Socrati Heritage"
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[3s] ease-out"
                    src="/images/footer1.png"
                    fill
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
                    <span className="text-white/80 text-[10px] md:text-xs font-black uppercase tracking-[0.6em] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Born in South Africa
                    </span>
                    <h1 className="text-white text-6xl md:text-9xl font-serif mb-8 drop-shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        The Socrati <span className="italic">Story</span>
                    </h1>
                    <div className="w-16 h-1 bg-white/30 rounded-full animate-in fade-in zoom-in duration-1000 delay-500"></div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/40">
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] rotate-90 mb-4">Explore</span>
                    <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent"></div>
                </div>
            </header>

            {/* The Legend Image Section */}
            <section className="w-full px-4 md:px-8 py-12 md:py-24">
                <div className="max-w-[1800px] mx-auto">
                    <Image
                        alt="About Socrati"
                        src="/images/aboutus.png"
                        width={2560}
                        height={1440}
                        className="w-full h-auto object-cover rounded-[2rem] shadow-2xl"
                    />
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
                                title: 'Premium Leather',
                                description: 'We source only the finest leathers to craft footwear and bags that stand the test of time, blending durability with luxury.',
                                icon: Sparkles,
                                color: 'bg-amber-50 text-amber-600'
                            },
                            {
                                title: 'Local Excellence',
                                description: 'With exclusive boutiques across South Africa, we offer a specialized and intimate shopping experience for every customer.',
                                icon: Trophy,
                                color: 'bg-emerald-50 text-emerald-600'
                            },
                            {
                                title: 'Timeless Style',
                                description: 'Designs for men and women that elegantly fuse classic sophistication with contemporary South African flair.',
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
                                alt="Socrati Boutique"
                                className="w-full h-full object-cover opacity-80"
                                src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2670&auto=format&fit=crop"
                                fill
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-text-main-light via-transparent to-transparent hidden lg:block"></div>
                        </div>
                        <div className="lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center space-y-10 text-white relative z-10">
                            <Quote className="w-16 h-16 text-primary/20 absolute top-12 right-12" />
                            <h2 className="text-4xl md:text-5xl font-serif italic leading-tight">
                                Step Into Our <br />World
                            </h2>
                            <p className="text-white/70 font-light leading-relaxed text-lg">
                                Our Socrati boutiques across South Africa are designed to be more than just stores; they are immersive retail destinations. Experience the rich scent of genuine leather and allow our dedicated staff to guide you toward your perfect pair of shoes or your next signature bag.
                            </p>
                            <div className="pt-6">
                                <Link
                                    href="/boutiques"
                                    className="inline-flex items-center gap-4 bg-white text-text-main-light px-12 py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-500 group/btn"
                                >
                                    Find a Boutique <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
