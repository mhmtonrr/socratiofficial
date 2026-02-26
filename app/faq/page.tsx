'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSection {
    title: string;
    items: FAQItem[];
}

const faqData: FAQSection[] = [
    {
        title: 'Authenticity & Craft',
        items: [
            {
                question: 'Where are Socrati products made?',
                answer: 'Every piece in our collection is handcrafted in our heritage atelier in Italy. We partner with master artisans who have preserved traditional shoemaking techniques for generations, ensuring unparalleled quality and soul in every stitch.',
            },
            {
                question: 'What materials do you use?',
                answer: 'We exclusively select the finest full-grain Italian leathers, ethically sourced suedes, and premium hardware. Our soles are predominantly hand-painted leather or specialized durable rubber, depending on the collection.',
            },
            {
                question: 'Do you offer bespoke or made-to-measure services?',
                answer: 'Currently, our bespoke service is available exclusively through our Milan and Johannesburg flagship boutiques. Please contact our concierge to schedule a private appointment for personalized fittings.',
            },
        ],
    },
    {
        title: 'Orders & Shipping',
        items: [
            {
                question: 'What are your delivery times for South Africa?',
                answer: 'Standard delivery across South Africa typically takes 2-4 business days. For Johannesburg and Pretoria, we often achieve 1-2 day delivery for in-stock items.',
            },
            {
                question: 'Is international shipping available?',
                answer: 'Yes, Socrati ships globally via DHL Express. Delivery times range from 3-7 business days depending on the destination. Duties and taxes are calculated at checkout for most regions.',
            },
            {
                question: 'Can I cancel or modify my order?',
                answer: 'As we strive for rapid dispatch, modifications are only possible within 2 hours of order placement. Please contact customercare@socratiofficial.com immediately for assistance.',
            },
        ],
    },
    {
        title: 'Returns & Exchanges',
        items: [
            {
                question: 'Are returns complimentary?',
                answer: 'We offer a 14-day return window. For our South African customers, we provide a complimentary collection service for returns of original, unworn items with all security tags intact.',
            },
            {
                question: 'How long does a refund take?',
                answer: 'Once your return is inspected and approved at our facility, refunds are processed within 5-10 business days. You will receive an email confirmation once the transaction is completed.',
            },
        ],
    },
    {
        title: 'Product Care',
        items: [
            {
                question: 'How should I store my Socrati shoes?',
                answer: 'We recommend using cedar shoe trees to maintain shape and absorb moisture. Always store your shoes in the provided dust bags and keep them in a cool, dry place away from direct sunlight.',
            },
            {
                question: 'Can I have my shoes repaired?',
                answer: 'Socrati offers a refurbishment service for our heritage collections. Visit any of our boutiques for an assessment by our experts, or contact our digital concierge for remote guidance.',
            },
        ],
    },
];

function FAQAccordion({ question, answer }: FAQItem) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-100 last:border-0 overflow-hidden">
            <button
                className="flex items-center justify-between py-6 w-full text-left group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-sm md:text-base font-serif transition-colors duration-300 ${isOpen ? 'text-primary' : 'text-text-main-light group-hover:text-primary'}`}>
                    {question}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform duration-500 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] pb-8' : 'max-h-0'}`}
            >
                <p className="text-sm text-gray-500 font-light leading-relaxed max-w-2xl italic">
                    {answer}
                </p>
            </div>
        </div>
    );
}

export default function FAQPage() {
    return (
        <div className="bg-white min-h-screen">
            <Header />

            <header className="bg-surface-light py-20 md:py-32 border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">Assistance</span>
                    <h1 className="text-4xl md:text-6xl font-serif text-text-main-light">
                        How can we help you?
                    </h1>
                    <p className="text-text-muted-light text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
                        Explore our curated selection of common inquiries. If you require further personal assistance, our concierge is always available.
                    </p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
                    {/* Category Navigation - Desktop Side */}
                    <aside className="lg:col-span-4 hidden lg:block">
                        <div className="sticky top-32 space-y-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 border-b border-gray-100 pb-4">Categories</h3>
                            <nav className="flex flex-col space-y-4">
                                {faqData.map((section) => (
                                    <button
                                        key={section.title}
                                        className="text-left text-sm text-text-muted-light hover:text-primary transition-colors hover:translate-x-1 duration-300"
                                        onClick={() => {
                                            const element = document.getElementById(section.title.toLowerCase().replace(/\s+/g, '-'));
                                            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }}
                                    >
                                        {section.title}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* FAQ Content */}
                    <div className="lg:col-span-8 space-y-20">
                        {faqData.map((section, sectionIndex) => (
                            <div key={sectionIndex} id={section.title.toLowerCase().replace(/\s+/g, '-')} className="scroll-mt-32">
                                <h2 className="text-xl md:text-2xl font-serif mb-8 text-text-main-light uppercase tracking-widest border-l-2 border-primary pl-6">
                                    {section.title}
                                </h2>
                                <div className="space-y-2">
                                    {section.items.map((item, itemIndex) => (
                                        <FAQAccordion key={itemIndex} question={item.question} answer={item.answer} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact CTA Section */}
                <div className="mt-40 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-surface-light p-10 text-center space-y-4 border border-gray-50 flex flex-col items-center group hover:shadow-xl transition-all duration-500">
                        <MessageCircle className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-text-main-light">Customer Support</h3>
                        <p className="text-[11px] text-gray-400 font-light leading-relaxed">For any inquiries, our team is here to assist you.</p>
                        <Link href="/contact" className="text-[10px] uppercase tracking-widest text-primary border-b border-primary/20 pb-1 hover:border-primary transition-colors">Contact Us</Link>
                    </div>

                    <div className="bg-surface-light p-10 text-center space-y-4 border border-gray-50 flex flex-col items-center group hover:shadow-xl transition-all duration-500">
                        <Phone className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-text-main-light">Boutique Liaison</h3>
                        <p className="text-[11px] text-gray-400 font-light leading-relaxed">Speak directly with our flagship experts.</p>
                        <a href="tel:+27111234567" className="text-[10px] uppercase tracking-widest text-primary border-b border-primary/20 pb-1 hover:border-primary transition-colors">+27 11 123 4567</a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
