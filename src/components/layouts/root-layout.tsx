import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";

const geistSans = localFont({
  src: "@/assets/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "@/assets/fonts/GeistMonoVF.woff",
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
        <main className="w-full h-full">{children}</main>
      </body>
    </html>
  );
}
