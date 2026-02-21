import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Dela_Gothic_One } from "next/font/google";
import { Toaster } from "sileo";

import { AuthStoreProvider } from "@/features/auth/shared";
import "@/styles/globals.css";

const IBMPlexSans = IBM_Plex_Sans({
    subsets: ["latin"],
    variable: "--font-IBM-plex-sans",
    weight: ["100", "200", "300", "400", "500", "600", "700"],
});

const IBMPlexMono = IBM_Plex_Mono({
    subsets: ["latin"],
    variable: "--font-IBM-plex-mono",
    weight: ["100", "200", "300", "400", "500", "600", "700"],
});

const delaGothicOne = Dela_Gothic_One({
    subsets: ["latin"],
    variable: "--font-dela-gothic",
    weight: "400",
});

export const metadata: Metadata = {
    title: "Plataforma PdA",
    description: "By Programadores do Amanhã",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className="flex w-full h-full">
            <body
                className={`w-full h-full flex ${IBMPlexSans.variable} ${IBMPlexMono.variable} ${delaGothicOne.variable} antialiased`}
            >
                <AuthStoreProvider>
                    <main className="flex w-full h-full overflow-hidden">{children}</main>
                </AuthStoreProvider>
                <Toaster />
            </body>
        </html>
    );
}
