import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <main className="border-grid flex flex-1 flex-col w-full h-full">
      <SidebarProvider defaultOpen={defaultOpen}>{children}</SidebarProvider>
    </main>
  );
}
