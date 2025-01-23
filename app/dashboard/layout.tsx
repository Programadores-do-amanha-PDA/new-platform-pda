export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="border-grid flex flex-1 flex-col">{children}</main>;
}
