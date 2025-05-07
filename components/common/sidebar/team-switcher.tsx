"use client";
import * as React from "react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
export function TeamSwitcher({
  team,
  userRole,
}: {
  team: {
    name: string;
    logo: React.ElementType;
  };
  userRole: string;
}) {
  const router = useRouter();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={() => router.push(`/dashboard/${userRole}`)}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar">
            <team.logo />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold">Plataforma PdA</span>
            <span className="truncate text-xs text-muted-foreground">{team.name}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
