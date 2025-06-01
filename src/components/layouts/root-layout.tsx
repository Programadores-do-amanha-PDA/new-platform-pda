"use client";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { useAuthConfirmation } from "@/features/auth/hooks/use-auth-confirmation";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "../../assets/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../../assets/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
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
    <html lang="pt-BR" className="w-full h-full flex bg-blue-200">
      <body
        className={`w-full h-full flex bg-red-200 ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="w-full h-full flex">{children}</main>
        <Toaster closeButton richColors />
      </body>
    </html>
  );
}
