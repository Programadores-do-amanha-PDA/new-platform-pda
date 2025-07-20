"use client";

export default function adminUsersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="border-grid flex flex-1 flex-col w-full h-full">
      {children}
    </main>
  );
}
