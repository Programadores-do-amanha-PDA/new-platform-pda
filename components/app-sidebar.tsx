"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  GraduationCap,
  Briefcase,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Empregabilidade Já",
      logo: GalleryVerticalEnd,
      plan: "Time PdA",
    },
    {
      name: "Empregabilidade Já",
      logo: AudioWaveform,
      plan: "Alumni",
    },
    {
      name: "Administrador",
      logo: Command,
      plan: "Time PdA",
    },
  ],
  navMain: [
    {
      title: "Vagas",
      url: "#",
      icon: Briefcase,
      isActive: true,
      items: [
        {
          title: "Todas as vagas",
          url: "#",
        },
        {
          title: "Buscar vagas",
          url: "#",
        },
      ],
    },
    {
      title: "Alumni",
      url: "#",
      icon: GraduationCap,
      items: [
        {
          title: "Todos os alumni",
          url: "#",
        },
        {
          title: "Adicionar alumni",
          url: "#",
        },
      ],
    },
    {
      title: "Apostilas",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Todas as apostilas",
          url: "#",
        },
        {
          title: "Criar nova",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
