"use client";
import Image from "next/image";

import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Briefcase, Users } from "lucide-react";
import { EmployerStackProvider } from "@/context/employer/stack-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, userRole } = useAuth();

  if (!user || !userRole || userRole !== "employer") {
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

  const data = {
    user: user,
    userRole: userRole,
    team: {
      name: "Empregabilidade Já",
      logo: () => (
        <Avatar className="size-8">
          <AvatarImage src="/assets/logos/simbolo_pda_fundo_branco.png" />
          <AvatarFallback>PdA</AvatarFallback>
        </Avatar>
      ),
    },

    navMain: [
      {
        title: "Vagas",
        url: "/dashboard/employer/jobs",
        icon: Briefcase,
        items: [
          {
            title: "Vagas curadas",
            url: "/dashboard/employer/jobs/curated",
          },
          {
            title: "Curadoria",
            url: "/dashboard/employer/jobs/curation",
          },
          {
            title: "Vagas arquivadas",
            url: "/dashboard/employer/jobs/archives",
          },
        ],
      },
      {
        title: "Alumni",
        url: "/dashboard/employer/alumni",
        icon: Users,
        items: [
          {
            title: "Todos os alumni",
            url: "/dashboard/employer/alumni/all",
          },
        ],
      },
    ],
    projects: [],
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar loading={!user || !userRole} data={data} />
      <EmployerStackProvider>{children}</EmployerStackProvider>
    </SidebarProvider>
  );
}
