"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "@/features/users/profile";

import { ClassroomT, SidebarDataT } from "@/types";
import pathLabels from "@/utils/path-labels";

export const ADMIN_CLASSROOM_PAGES_KEYS = [
    "overview",
    "kpis",
    "attendance",
    "satisfaction",
    "activities",
    "projects",
    "coodesh",
    "zoom",
];

export const generateSidebarConfig = (userProfile: Profile, classrooms: ClassroomT[]): SidebarDataT => {
    return {
        userProfile,
        team: {
            name: "Administrador",
            logo: () => (
                <Avatar className="size-8">
                    <AvatarImage src="/assets/logos/symbol-white-background.png" />
                    <AvatarFallback>PdA</AvatarFallback>
                </Avatar>
            ),
        },
        navMain: [
            {
                title: pathLabels["users"],
                url: "/dashboard/users",
                ref: "users",
                icon: "users",
            },
            // {
            //   title: pathLabels["jobs"],
            //   url: "/dashboard/jobs",
            //   ref: "jobs",
            //   icon: Briefcase,
            //   isActive: false,
            //   items: [
            //     {
            //       title: pathLabels["curated"],
            //       url: "/dashboard/jobs/curated",
            //     },
            //     {
            //       title: pathLabels["curation"],
            //       url: "/dashboard/jobs/curation",
            //     },
            //     {
            //       title: pathLabels["archives"],
            //       url: "/dashboard/jobs/archives",
            //     },
            //   ],
            // },
        ],
        classRooms: classrooms
            .sort((a, b) => a.created_at.localeCompare(b.created_at))
            .map((classroom) => ({
                title: classroom.name,
                ref: classroom.id,
                url: `/dashboard/classrooms/${classroom.id}`,
                icon: classroom.icon,
                isActive: false,
                items: ADMIN_CLASSROOM_PAGES_KEYS.map((key) => ({
                    ref: key,
                    title: pathLabels[key],
                    url: `/dashboard/classrooms/${classroom.id}/${key}`,
                })),
            })),
        projects: [],
    };
};