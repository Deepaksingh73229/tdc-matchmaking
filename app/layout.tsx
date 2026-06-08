import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layouts/Navbar"
import Footer from "@/components/layouts/Footer"
import { Toaster } from "sonner"
import { NextAuthProvider } from "@/components/wrappers/Providers";
import { ThemeProvider } from "@/components/wrappers/theme-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "TDC Matchmaker Dashboard",
    description: "Internal MVP dashboard for The Date Crew matchmakers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <NextAuthProvider>
                            {/* <Navbar /> */}

                            {children}

                            <Toaster
                                position="top-right"
                                richColors
                                toastOptions={{
                                    style: {
                                        borderRadius: "12px",
                                        fontFamily: "DM Sans, sans-serif",
                                    },
                                }}
                            />

                            {/* <Footer /> */}
                    </NextAuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}