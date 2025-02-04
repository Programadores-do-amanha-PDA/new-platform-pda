import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/auth-context";

const geistSans = localFont({
  src: "../public/assets/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../public/assets/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Plataforma PdA",
  description: "By Programadores do Amanhã",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`w-screen h-screen ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <main className="w-full h-full">{children}</main>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
