"use client";
import ProfilesDataTable from "@/components/users/profiles-data-table";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative w-full flex flex-col p-6 gap-4 xl:p-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2 flex flex-col gap-1">
          <h1 className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
            Todos os Usuários
          </h1>
        </div>
      </div>

      <div className="flex h-5 items-center space-x-1 text-sm leading-none">
        <SidebarTrigger />
        <Separator orientation="vertical" className="!mx-3" />
        <div className="truncate text-muted-foreground">Inicio</div>
        <ChevronRight className="h-3.5 w-3.5" />
        <div className="text-muted-foreground">Usuários</div>
        <ChevronRight className="h-3.5 w-3.5" />
        <div className="text-foreground">Todos os Usuários</div>
      </div>

      <div className="space-y-2">
        <ProfilesDataTable />
      </div>
    </main>
  );
}
