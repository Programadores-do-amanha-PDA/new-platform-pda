"use client";
import JobsDataTable from "@/components/jobs/all/jobs-data-table";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative w-full h-full p-6 lg:gap-10 lg:p-8">
      <div className="w-full min-w-0">
        <div className="mb-4 flex h-5 items-center space-x-1 text-sm leading-none">
          <SidebarTrigger />
          <Separator orientation="vertical" className="!mx-3" />
          <div className="truncate text-muted-foreground">Inicio</div>
          <ChevronRight className="h-3.5 w-3.5" />
          <div className="text-muted-foreground">Vagas</div>
          <ChevronRight className="h-3.5 w-3.5" />
          <div className="text-foreground">Todas as vagas</div>
        </div>
        <div className="space-y-2">
          <h1 className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
            Todos as vagas
          </h1>
        </div>
        <div className="space-y-2">
          <JobsDataTable />
        </div>
      </div>
    </main>
  );
}
