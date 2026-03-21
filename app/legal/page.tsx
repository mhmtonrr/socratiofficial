
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function LegalNotesPage() {
    const sections = [
        {
            title: "1. Corporate Information",
            content: "Socrati is a registered trademark of Socrati Luxury Group S.A. Head Office: Via Montenapoleone, 12, 20121 Milano MI, Italy. Share Capital: Euro 66.187.078,00 fully paid up. VAT Number: IT01113570442."
        },
        {
            title: "2. Intellectual Property",
            content: "All contents of this website, including but not limited to designs, text, graphics, logos, images, and software, are the exclusive property of Socrati and are protected by international copyright and trademark laws. Any unauthorized use, reproduction, or distribution is strictly prohibited."
        },
        {
            title: "3. Terms of Use",
            content: "By accessing and using this website, you agree to comply with and be bound by the following terms and conditions. The website is provided for your personal, non-commercial use only."
        },
        {
            title: "4. Limitation of Liability",
            content: "Socrati strives to provide accurate and up-to-date information. However, we do not guarantee the completeness or accuracy of any information on the site and are not liable for any damages arising from your use of the website."
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-24">
                <h1 className="text-4xl font-serif text-text-main-light mb-12 border-b border-gray-100 pb-8">Legal Notes</h1>
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
