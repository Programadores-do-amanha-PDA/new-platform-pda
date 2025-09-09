import { cookies } from "next/headers";

import { SidebarProvider } from "@/components/ui/sidebar";
import { RoleProvider } from "@/providers/role-provider";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <main className="flex w-full h-full bg-sidebar overflow-hidden">
      <SidebarProvider
        defaultOpen={defaultOpen}
        className="w-full h-full flex pt-4 pr-4 pb-4 overflow-hidden"
      >
        <RoleProvider>{children}</RoleProvider>
      </SidebarProvider>
    </main>
  );
}
