import type { Metadata } from "next";
import { Playfair_Display, Inter, Roboto_Condensed } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: "swap",
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const robotoCondensed = Roboto_Condensed({
    subsets: ["latin"],
    variable: "--font-roboto-condensed",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Socrati | Luxury Footwear & Accessories",
    description: "Timeless Elegance - Luxury shoes, bags, and accessories for men and women.",
};

import AuthProvider from "./components/AuthProvider";
import { CartProvider } from "../context/CartContext";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${playfair.variable} ${inter.variable} ${robotoCondensed.variable}`}>
            <body className="bg-background-light text-text-main-light font-sans antialiased">
                <AuthProvider>
                    <CartProvider>
                        {children}
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
