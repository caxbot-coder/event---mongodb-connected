'use client';

import { Outfit } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SoftBackdrop from "@/components/SoftBackdrop";
import LenisScroll from "@/components/lenis";
import { AuthProvider } from "@/components/AuthContext";
import { HotToastProvider } from "@/components/HotToastContext";
import PremiumGateWrapper from "@/components/PremiumGateWrapper";
import { usePathname } from "next/navigation";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const outfit = Outfit({
    variable: "--font-sans",
    subsets: ["latin"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');

    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <HotToastProvider>
                        <AnalyticsTracker />
                        <SoftBackdrop />
                        <LenisScroll />
                        {!isAdminRoute && <Navbar />}
                        {children}
                        {!isAdminRoute && <Footer />}
                    </HotToastProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
