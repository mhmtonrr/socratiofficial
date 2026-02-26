import Header from '../components/Header';
import Footer from '../components/Footer';
import { Shield, Lock, Eye, FileText, Globe, Bell } from 'lucide-react';

export default function PrivacyPolicyPage() {
    const sections = [
        {
            title: "Our Commitment",
            icon: Shield,
            content: "At Socrati, we understand that privacy is the ultimate luxury. We are committed to protecting the personal information you entrust to us, ensuring that your experience with our maison is as secure as it is sophisticated."
        },
        {
            title: "Information Collection",
            icon: Eye,
            content: "We collect information essential to providing you with an exquisite service. This includes personal identifiers (name, email), transactional details for your purchases, and technical data that helps us refine our digital boutique's performance to your preferences."
        },
        {
            title: "Artisanal Use of Data",
            icon: FileText,
            content: "Your data is used to orchestrate a seamless journey: from processing your bespoke orders to delivering personalized invitations to new collections. We do not sell your information; it is used exclusively to enhance your relationship with Socrati."
        },
        {
            title: "Digital Security",
            icon: Lock,
            content: "We employ industry-leading encryption and security protocols to safeguard your data. Like our footwear, our security measures are crafted with precision to prevent unauthorized access and maintain the integrity of your personal world."
        },
        {
            title: "Global Compliance",
            icon: Globe,
            content: "Socrati adheres to international data protection standards, including GDPR. You have the right to access, rectify, or request the erasure of your personal data at any time through our privacy concierge."
        },
        {
            title: "Policy Refinements",
            icon: Bell,
            content: "As our boutique evolves, so may our privacy practices. We will notify you of any significant refinements to this policy, ensuring you remain informed and in control of your digital footprint."
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            <Header />

            <header className="relative py-24 md:py-32 overflow-hidden bg-gray-50 border-b border-gray-100">
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                    <h1 className="text-[25vw] font-serif font-black leading-none">PRIVACY</h1>
                </div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-serif text-text-main-light mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        Privacy <span className="italic">&</span> Security
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-2 duration-700">
                        Safeguarding your digital elegance
                    </p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                    {sections.map((section, idx) => {
                        const Icon = section.icon;
                        return (
                            <div key={idx} className="space-y-6 group animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-gray-100">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text-main-light">{section.title}</h2>
                                    <p className="text-sm text-gray-500 font-light leading-relaxed">{section.content}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-24 p-12 lg:p-16 bg-text-main-light text-white rounded-[3rem] shadow-2xl shadow-gray-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                        <Shield className="w-40 h-40" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-3xl font-serif mb-6 italic">Privacy Concierge</h2>
                        <p className="text-white/70 text-sm leading-relaxed mb-8">
                            Should you have any inquiries regarding your personal data or wish to exercise your rights, our dedicated privacy team is at your disposal.
                        </p>
                        <a
                            href="mailto:privacy@socratiofficial.com"
                            className="inline-block bg-white text-text-main-light px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                        >
                            Contact Privacy Team
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
