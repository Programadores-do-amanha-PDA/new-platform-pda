"use client";

import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import pathLabels from "@/utils/path-labels";

export function AppBar() {
  const path = usePathname();
  const segments = path.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] || "Inicio";

  const title =
    pathLabels[lastSegment] ||
    lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  return (
    <div className="w-full flex gap-2 sticky top-0 left-0 bg-sidebar py-2 z-50 px-4 border-b">
      <div className="flex gap-4 items-center">
        <SidebarTrigger className="w-max border size-10 flex items-center justify-center rounded-sm bg-sidebar-accent" />

        <div className="space-y-2 flex flex-col gap-1">
          <h1
            className={cn(
              "scroll-m-20 text-xl md:text-3xl font-bold tracking-tight"
            )}
          >
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
}
