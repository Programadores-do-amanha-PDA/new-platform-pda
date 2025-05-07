"use client";
import Image from "next/image";

import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

import { SidebarProvider } from "@/components/ui/sidebar";

import { AlumniStackProvider } from "@/context/alumni/stack-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, userRole } = useAuth();

  if (!user || !userRole || userRole !== "alumni") {
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

  return (
    <SidebarProvider defaultOpen={true}>
      <AlumniStackProvider userRole={userRole} user={user}>
        {children}
      </AlumniStackProvider>
    </SidebarProvider>
  );
}
