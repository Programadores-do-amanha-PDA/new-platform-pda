"use client";
import * as React from "react";
import { useRouter } from "next/navigation";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { TeamInfoT } from "@/components/shared/sidebar/types";

export default function TeamSwitcher({ team }: { team: TeamInfoT }) {
  const router = useRouter();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
          onClick={() => router.push(`/dashboard/`)}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar">
            <team.logo />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold">Plataforma PdA</span>
            <span className="truncate text-xs text-muted-foreground">
              {team.name}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
