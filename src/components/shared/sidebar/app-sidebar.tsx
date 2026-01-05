"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import TeamSwitcher from "./team-switcher";
import NavMain from "./nav-main";
import NavProjects from "./nav-projects";
import NavUser from "./nav-user";

import { AppSidebarPropsT } from "@/types/sidebar";

export default function AppSidebar({ ...props }: AppSidebarPropsT) {
  return (
    <Sidebar collapsible="icon" {...props} className="py-4 border-0!">
      <SidebarHeader>
        {props.data.team && <TeamSwitcher team={props.data.team} />}
      </SidebarHeader>
      <SidebarContent>
        {props.data.navMain && props.data.navMain.length > 0 && (
          <NavMain items={props.data.navMain} title="Geral" />
        )}
        {props.data.classRooms && props.data.classRooms.length > 0 && (
          <NavMain items={props.data.classRooms} title="Turmas" />
        )}
        {props.data.projects && props.data.projects.length > 0 && (
          <NavProjects projects={props.data?.projects} />
        )}
      </SidebarContent>
      <SidebarFooter className="flex pb-0 w-full h-max">
        <NavUser user={props.data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
