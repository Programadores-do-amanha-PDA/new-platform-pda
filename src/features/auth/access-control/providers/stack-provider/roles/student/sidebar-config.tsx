"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarData } from "@/components/shared/sidebar/types";

import pathLabels from "@/utils/path-labels";
import { Classroom } from "@/features/classrooms/types";
import { Profile } from "@/features/users/profile/types/profile";

export const generateSidebarConfig = (userProfile: Profile, classrooms: Classroom[]): SidebarData => {
    return {
        userProfile,
        team: {
            name: "Estudante",
            logo: () => (
                <Avatar className="size-8">
                    <AvatarImage src="logos/symbol-white-background.png" />
                    <AvatarFallback>PdA</AvatarFallback>
                </Avatar>
            ),
        },
        navMain: [],
        classRooms: classrooms
            .sort((a, b) => a.created_at.localeCompare(b.created_at))
            .map((classroom) => ({
                title: classroom.name,
                ref: classroom.id,
                url: `/dashboard/classrooms/${classroom.id}`,
                icon: classroom.icon,
                isActive: false,
                items: [
                    {
                        title: pathLabels["projects"],
                        url: `/dashboard/classrooms/${classroom.id}/projects`,
                    },
                ],
            })),
        projects: [],
    };
};
