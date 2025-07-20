"use client";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import TeamSwitcher from "./team-switcher";
import NavMain from "./nav-main";
import NavProjects from "./nav-projects";
import NavUser from "./nav-user";

import { AppSidebarPropsT } from "@/types/sidebar";

export default function AppSidebar({ ...props }: AppSidebarPropsT) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {props.data.team && (
          <TeamSwitcher team={props.data.team}/>
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
        <NavUser user={props.data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
