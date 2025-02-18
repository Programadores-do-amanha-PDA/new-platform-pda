"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Users } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AdminStackProvider } from "@/context/admin/stack-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, userRole } = useAuth();

  if (!user || !userRole || userRole !== "admin") {
    return (
      <div className="relative p-6 lg:gap-10 lg:p-8 w-screen h-screen">
        <div className="w-full h-full flex flex-col gap-8 items-center justify-center space-y-2">
          <Image
            src={"/assets/images/empty/no-access.png"}
            alt=""
            width={400}
            height={400}
            className="w-1/3"
          />
          <h1
            className={cn(
              "scroll-m-20 text-3xl font-bold tracking-tight text-primary-foreground"
            )}
          >
            Você não tem acesso a este conteúdo!
          </h1>
        </div>
      </div>
    );
  }

  const sidebarData = {
    user: user,
    userRole: userRole,
    team: {
      name: "Administrador",
      logo: () => (
        <Avatar className="size-8">
          <AvatarImage src="/assets/logos/simbolo_pda_fundo_branco.png" />
          <AvatarFallback>PdA</AvatarFallback>
        </Avatar>
      )
    },
    navMain: [
      {
        title: "Usuários",
        url: "/dashboard/admin/users",
        icon: Users,
        items: [
          {
            title: "Todos os usuários",
            url: "/dashboard/admin/users/all",
          },
        ],
      },
      {
        title: "Vagas",
        url: "/dashboard/admin/jobs",
        icon: Briefcase,
        isActive: true,
        items: [
          {
            title: "Vagas curadas",
            url: "/dashboard/admin/jobs/curated",
          },
          {
            title: "Curadoria de vagas",
            url: "/dashboard/admin/jobs/curation",
          },
        ],
      },
    ],
    projects: [],
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar loading={!user || !userRole} data={sidebarData} />
      <AdminStackProvider>{children}</AdminStackProvider>
    </SidebarProvider>
  );
}
