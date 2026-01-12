import { LucideIcon } from "lucide-react";
import { AuthUserWithProfile } from "@/features/dashboard/profile";

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
  icon?: string;
  isActive?: boolean;
  items?: NavItemT[];
}

export interface ProjectItemT {
  title: string;
  url: string;
  icon: LucideIcon;
  ref?: string;
}

export interface SidebarDataT {
  team?: TeamInfoT;
  navMain?: SidebarNavItemT[];
  classRooms?: SidebarNavItemT[];
  projects?: ProjectItemT[];
  user: AuthUserWithProfile;
}

export interface AppSidebarPropsT {
  data: SidebarDataT;
}
