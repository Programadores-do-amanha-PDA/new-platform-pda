import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "sonner";

import "@/styles/globals.css";
import AuthStoreProvider from "@/features/shared/auth/provider";

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
            <body className={`w-full h-full flex ${IBMPlexSans.variable} ${IBMPlexMono.variable} antialiased`}>
                <AuthStoreProvider>
                    <main className="flex w-full h-full overflow-hidden">{children}</main>
                </AuthStoreProvider>
                <Toaster closeButton={true} expand richColors visibleToasts={9} />
            </body>
        </html>
    );
}
