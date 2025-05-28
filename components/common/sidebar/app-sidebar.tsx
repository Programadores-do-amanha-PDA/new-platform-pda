"use client";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "@/components/common/sidebar/team-switcher";
import { NavMain } from "@/components/common/sidebar/nav-main";
import { NavProjects } from "@/components/common/sidebar/nav-projects";
import { NavUser } from "@/components/common/sidebar/nav-user";
import { LucideIcon } from "lucide-react";
import { AuthUserWithProfileType } from "@/types/auth-types";
import { Separator } from "../../ui/separator";

interface AppSidebarProps {
  data: {
    team: {
      name: string;
      logo: React.ElementType;
    };
    navMain: {
      title: string;
      ref?: string;
      url: string;
      icon?: LucideIcon;
      isActive?: boolean;
      items?: {
        title: string;
        url: string;
      }[];
    }[];
    classRooms?: {
      title: string;
      ref?: string;
      url: string;
      icon?: LucideIcon;
      isActive?: boolean;
      items?: {
        title: string;
        url: string;
      }[];
    }[];
    projects: {
      name: string;
      url: string;
      icon: LucideIcon;
    }[];
    user: AuthUserWithProfileType;
    userRole: string;
  };
}

export function AppSidebar({ ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {props.data.team && (
          <TeamSwitcher team={props.data.team} userRole={props.data.userRole} />
        )}
      </SidebarHeader>
      <SidebarContent>
        {props.data.navMain && (
          <NavMain items={props.data.navMain} title="Geral" />
        )}
        {props.data.classRooms && (
          <>
            <Separator />
            <NavMain items={props.data.classRooms} title="Turmas" />
          </>
        )}
        {props.data.projects && props.data.projects.length > 0 && (
          <NavProjects projects={props.data?.projects} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={props.data.user} userRole={props.data.userRole} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
