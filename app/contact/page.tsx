import Header from '../components/Header';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
    return (
        <>
            <Header />
            <header className="bg-surface-light py-16 md:py-24 border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif text-text-main-light mb-6">Contact Us</h1>
                    <p className="text-text-muted-light text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
                        We're here to assist you. Whether you have a question about our products, need help with an order, or just want to share your feedback, our team is ready to answer all your questions.
                    </p>
                </div>
            </header>

            <section className="py-20 bg-background-light">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <div>
                            <h2 className="text-2xl font-serif mb-8 text-text-main-light">Get in Touch</h2>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="firstName">
                                            First Name*
                                        </label>
                                        <input
                                            className="w-full bg-transparent border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-none"
                                            id="firstName"
                                            type="text"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="lastName">
                                            Last Name*
                                        </label>
                                        <input
                                            className="w-full bg-transparent border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-none"
                                            id="lastName"
                                            type="text"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="email">
                                        E-mail Address*
                                    </label>
                                    <input
                                        className="w-full bg-transparent border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-none"
                                        id="email"
                                        type="email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="phone">
                                        Phone Number
                                    </label>
                                    <input
                                        className="w-full bg-transparent border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-none"
                                        id="phone"
                                        type="tel"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="subject">
                                        Subject*
                                    </label>
                                    <select
                                        className="w-full bg-transparent border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-none"
                                        id="subject"
                                    >
                                        <option>Select a subject</option>
                                        <option>Product Inquiry</option>
                                        <option>Order Status</option>
                                        <option>Returns & Exchanges</option>
                                        <option>General Question</option>
                                        <option>Feedback</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="message">
                                        Message*
                                    </label>
                                    <textarea
                                        className="w-full bg-transparent border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-none resize-none"
                                        id="message"
                                        rows={6}
                                    ></textarea>
                                </div>
                                <div className="flex items-start gap-2">
                                    <input className="mt-1 border-gray-300 text-primary focus:ring-primary rounded-sm bg-transparent" id="privacy" type="checkbox" />
                                    <label className="text-xs text-text-muted-light leading-relaxed" htmlFor="privacy">
                                        I have read and accept the <a className="underline" href="/privacy">Privacy Policy</a>
                                    </label>
                                </div>
                                <button
                                    className="w-full bg-text-main-light text-surface-light px-8 py-4 uppercase text-xs tracking-widest hover:bg-primary hover:text-white transition-all duration-300"
                                    type="submit"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>

                        <div className="space-y-12">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-primary">Contact Information</h3>
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-primary">Email Us</h3>
                                        <p className="text-lg font-serif mb-1">
                                            <a className="hover:text-primary transition-colors" href="mailto:customercare@socratiofficial.com">
                                                customercare@socratiofficial.com
                                            </a>
                                        </p>
                                        <p className="text-xs text-text-muted-light mt-1">We aim to reply within 24 hours.</p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-primary">Visit Our Boutique</h3>
                                        <address className="not-italic text-sm text-text-main-light leading-relaxed">
                                            Socrati Official<br />
                                            Via Montenapoleone, 12<br />
                                            20121 Milano MI<br />
                                            Italy
                                        </address>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-primary">Call Us</h3>
                                        <p className="text-lg font-serif mb-1">
                                            <a className="hover:text-primary transition-colors" href="tel:+390212345678">
                                                +39 02 1234 5678
                                            </a>
                                        </p>
                                        <p className="text-xs text-text-muted-light mt-1">Mon-Fri: 9:00 AM - 6:00 PM (CET)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface-light border border-gray-200 p-8">
                                <h3 className="text-lg font-serif mb-4 text-text-main-light">Customer Service Hours</h3>
                                <div className="space-y-2 text-sm text-text-muted-light">
                                    <div className="flex justify-between">
                                        <span>Monday - Friday</span>
                                        <span className="font-medium text-text-main-light">9:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Saturday</span>
                                        <span className="font-medium text-text-main-light">10:00 AM - 4:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sunday</span>
                                        <span className="font-medium text-text-main-light">Closed</span>
                                    </div>
                                </div>
                                <p className="text-xs text-text-muted-light mt-4">All times are Central European Time (CET)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative h-[500px] w-full">
                <iframe
                    allowFullScreen
                    className="w-full h-full"
                    height="100%"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2790.8797300756745!2d9.189574476685827!3d45.46820463283739!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c6ae35c91f1b%3A0x6b772c72477d5402!2sVia%20Montenapoleone%2C%2012%2C%2020121%20Milano%20MI%2C%20Italy!5e0!3m2!1sen!2sus!4v1714850000000!5m2!1sen!2sus"
                    style={{ border: 0, filter: 'grayscale(100%) invert(0%) contrast(85%)', opacity: 0.9 }}
                    title="Socrati Official Milan Boutique"
                    width="100%"
                ></iframe>
                <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-10 bg-surface-light/95 backdrop-blur-sm p-8 shadow-xl max-w-xs border-l-4 border-primary">
                    <h3 className="text-lg font-serif mb-2 text-text-main-light">Milan Flagship</h3>
                    <p className="text-xs text-text-muted-light leading-relaxed">
                        Experience our full collection in the heart of Milan's fashion district. Book an appointment for a personalized shopping experience.
                    </p>
                    <a className="inline-block mt-4 text-xs uppercase tracking-widest underline underline-offset-4 hover:text-primary transition-colors" href="#">
                        Book Appointment
                    </a>
                </div>
            </section>

            <Footer />
        </>
    );
}
