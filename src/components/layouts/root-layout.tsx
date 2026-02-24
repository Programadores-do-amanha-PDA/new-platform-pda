import type { Metadata } from "next";
import { Toaster } from "sileo";

import { IBMPlexSans, IBMPlexMono, delaGothicOne } from "@/utils/fonts";
import "@/styles/globals.css";
import { AuthStoreProvider } from "@/features/auth/shared";

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
        <body
            className={`w-full h-full flex ${IBMPlexSans.variable} ${IBMPlexMono.variable} ${delaGothicOne.variable} antialiased`}
        >
            <AuthStoreProvider>
                <main className="flex w-full h-full overflow-hidden">{children}</main>
            </AuthStoreProvider>
            <Toaster />
        </body>
    );
}
