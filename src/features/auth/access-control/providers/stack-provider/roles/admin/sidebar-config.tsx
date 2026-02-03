"use client";

import { SidebarData } from "@/components/shared/sidebar/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Classroom } from "@/features/classrooms/types";
import { ADMIN_CLASSROOM_PAGES_KEYS } from "@/features/classrooms/utils/constants";
import { Profile } from "@/features/users/profile";

import pathLabels from "@/utils/path-labels";

export const generateSidebarConfig = (userProfile: Profile, classrooms: Classroom[]): SidebarData => {
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
                    title: pathLabels[key] ?? key,
                    url: `/dashboard/classrooms/${classroom.id}/${key}`,
                })),
            })),
        projects: [],
    };
};
