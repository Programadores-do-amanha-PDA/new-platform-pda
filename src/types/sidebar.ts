import { LucideIcon } from "lucide-react";
import { AuthUserWithProfileT } from "./auth";

export interface TeamInfoT {
  name: string;
  logo: React.ElementType;
}

export interface NavItemT {
  title: string;
  url: string;
}

export interface SidebarNavItemT extends NavItemT {
  ref?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavItemT[];
}

export interface ProjectItemT {
  name: string;
  url: string;
  icon: LucideIcon;
}

export interface SidebarDataT {
  team?: TeamInfoT;
  navMain?: SidebarNavItemT[];
  classRooms?: SidebarNavItemT[];
  projects?: ProjectItemT[];
  user: AuthUserWithProfileT;
}

export interface AppSidebarPropsT {
  data: SidebarDataT;
}
