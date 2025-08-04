import { cookies } from "next/headers";

import { SidebarProvider } from "@/components/ui/sidebar";
import UsersCombinedProvider from "@/providers/users-combined-provider";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <main className="border-grid flex flex-1 flex-col w-full h-full">
      <SidebarProvider defaultOpen={defaultOpen}>
        <UsersCombinedProvider>{children}</UsersCombinedProvider>
      </SidebarProvider>
    </main>
  );
}
