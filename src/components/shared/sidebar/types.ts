import { Profile } from "@/features/users/profile/types/profile";
import { LucideIcon } from "lucide-react";
import type { ElementType } from "react";

export interface TeamInfoT {
    name: string;
    logo: ElementType;
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

export interface SidebarData {
    team?: TeamInfoT;
    navMain?: SidebarNavItemT[];
    classRooms?: SidebarNavItemT[];
    projects?: ProjectItemT[];
    userProfile: Profile;
}

export interface AppSidebarPropsT {
    data: SidebarData;
}
