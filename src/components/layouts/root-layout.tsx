"use client";
import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "sonner";

import "@/styles/globals.css";
import useAuthConfirmation from "@/features/auth/hooks/use-auth-confirmation";
import AuthStoreProvider from "@/providers/shared/auth-store-provider";

const IBMPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

const IBMPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-geist-sans",
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
  useAuthConfirmation();

  return (
    <html lang="pt-BR" className="w-full h-full flex">
      <body
        className={`w-full h-full flex ${IBMPlexSans.variable} ${IBMPlexMono.variable} antialiased`}
      >
        <AuthStoreProvider>
          <main className="w-full h-full flex">{children}</main>
        </AuthStoreProvider>
        <Toaster closeButton richColors />
      </body>
    </html>
  );
}
