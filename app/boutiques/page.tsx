
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Clock, Phone, ArrowRight } from 'lucide-react';

export default function BoutiquesPage() {
    const boutiques = [
        {
            id: 1,
            name: "Socrati Oceans Mall",
            location: "Umhlanga, KwaZulu-Natal, South Africa",
            address: "Socrati Oceans 7 &, 10 Lagoon Dr, Umhlanga, uMhlanga, 4320 shop No 238 platinum walk upper level",
            phone: "+27 10 880 7799",
            hours: "Mon - Sat: 09:00 - 19:00\nSun & Public Holidays: 09:00 - 18:00",
            image: "/images/Socrati Oceans 7.png",
            status: "Open Now"
        },
        {
            id: 2,
            name: "Socrati Bedford Centre",
            location: "Bedfordview, Johannesburg, South Africa",
            address: "Socrati Bedford Centre Van Der Linde Rd, Bedfordview, Johannesburg, 2007 shop number u11 entrance 3",
            phone: "+27 11 615 3522",
            hours: "Mon - Sat: 09:00 - 18:00\nSun & Public Holidays: 09:00 - 17:00",
            image: "/images/Socrati Bedford Centre.png",
            status: "Open Now"
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            <Header />

            <header className="relative w-full h-[70vh] overflow-hidden">
                <Image
                    alt="Socrati Boutiques"
                    className="w-full h-full object-cover brightness-[0.6] scale-105 animate-subtle-zoom"
                    src="/images/boutiques-banner.png"
                    fill
                    priority
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                    <span className="text-white text-[10px] md:text-xs uppercase tracking-[0.5em] mb-4 opacity-0 animate-fade-in-up font-bold">Unveiling Timeless Elegance</span>
                    <h1 className="text-white text-5xl md:text-8xl font-serif mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>Our Boutiques</h1>
                    <div className="w-32 h-px bg-white/40 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 gap-32">
                    {boutiques.map((boutique, index) => (
                        <section key={boutique.id} className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 lg:gap-20 items-center`}>
                            {/* Boutique Image */}
                            <div className="w-full md:w-[60%] relative aspect-[16/10] overflow-hidden group shadow-2xl rounded-3xl">
                                <Image
                                    alt={boutique.name}
                                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                                    src={boutique.image}
                                    fill
                                />
                            </div>

                            {/* Boutique Info */}
                            <div className="w-full md:w-[40%] space-y-8">
                                <div className="space-y-4">
                                    <span className="text-primary text-xs font-bold uppercase tracking-[0.3em] block">{boutique.location}</span>
                                    <h2 className="text-4xl md:text-5xl font-serif text-text-main-light">{boutique.name}</h2>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">{boutique.status}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-primary mt-1" />
                                            <div>
                                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-main-light mb-1">Address</h4>
                                                <p className="text-sm text-gray-500 font-light leading-relaxed">{boutique.address}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Phone className="w-4 h-4 text-primary mt-1" />
                                            <div>
                                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-main-light mb-1">Contact</h4>
                                                <p className="text-sm text-gray-400 font-light">{boutique.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Clock className="w-4 h-4 text-primary mt-1" />
                                            <div>
                                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-main-light mb-1">Hours</h4>
                                                <p className="text-sm text-gray-500 font-light whitespace-pre-line">{boutique.hours}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <button className="group flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em] text-text-main-light hover:text-primary transition-colors">
                                        Get Directions <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                                    </button>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </main>

            {/* Newsletter Interruption */}
            <section className="bg-gray-50 py-24 px-4 overflow-hidden relative">
                <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
                    <h3 className="text-3xl md:text-4xl font-serif text-text-main-light">Experience Socrati in Person</h3>
                    <p className="text-gray-500 font-light max-w-xl mx-auto italic">
                        "Visit our boutiques to receive personalized style advice from our master curators and experience the unmatched quality of Italian leather firsthand."
                    </p>
                    <Link href="/contact" className="inline-block bg-text-main-light text-white px-12 py-4 uppercase text-xs tracking-[0.2em] font-bold hover:bg-primary transition-all duration-500">
                        Book a Private Appointment
                    </Link>
                </div>
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
            </section>

            <Footer />
        </div>
    );
}
