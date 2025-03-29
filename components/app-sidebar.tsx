"use client";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "@/components/team-switcher";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { LucideIcon } from "lucide-react";
import { AuthUserWithProfileType } from "@/types/auth";

interface AppSidebarProps {
  data: {
    team: {
      name: string;
      logo: React.ElementType;
    };
    navMain: {
      title: string;
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
  loading: boolean;
}

export function AppSidebar({ ...props }: AppSidebarProps) {
  if (props.loading) {
    return (
      <Sidebar
        collapsible="icon"
        {...props}
        className="animate-pulse flex flex-col bg-background"
      >
        <SidebarHeader className="animate-pulse bg-primary/15 h-12 rounded-sm"></SidebarHeader>
        <SidebarContent className="animate-pulse bg-primary/15 h-full rounded-sm my-4"></SidebarContent>
        <SidebarFooter className="animate-pulse bg-primary/15 h-12 rounded-sm"></SidebarFooter>
        <SidebarRail />
      </Sidebar>
    );
  }
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {props.data.team && (
          <TeamSwitcher team={props.data.team} userRole={props.data.userRole} />
        )}
      </SidebarHeader>
      <SidebarContent>
        {props.data.navMain && (
          <NavMain items={props.data.navMain} title="Menu Principal" />
        )}
        {props.data.classRooms && (
          <NavMain items={props.data.classRooms} title="Turmas" />
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
