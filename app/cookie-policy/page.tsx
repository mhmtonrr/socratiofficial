
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CookiePolicyPage() {
    const sections = [
        {
            title: "What are Cookies?",
            content: "Cookies are small text files stored on your device that help us provide a better browsing experience. They allow us to remember your preferences and analyze how our site is used."
        },
        {
            title: "Types of Cookies We Use",
            content: "We use essential cookies for site functionality, analytical cookies to understand user interaction, and marketing cookies to show relevant advertisements."
        },
        {
            title: "Managing Cookies",
            content: "You can manage or disable cookies through your browser settings. However, please note that disabling certain cookies may affect the performance of our website."
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-24">
                <h1 className="text-4xl font-serif text-text-main-light mb-12 border-b border-gray-100 pb-8">Cookie Policy</h1>
                <div className="space-y-12">
                    {sections.map((section, idx) => (
                        <div key={idx} className="space-y-4">
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-main-light">{section.title}</h2>
                            <p className="text-sm text-gray-500 font-light leading-relaxed">{section.content}</p>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
