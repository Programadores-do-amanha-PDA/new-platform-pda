"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "@/features/users/profile";

import { SidebarDataT, ClassroomT } from "@/types";
import pathLabels from "@/utils/path-labels";

export const generateSidebarConfig = (userProfile: Profile, classrooms: ClassroomT[]): SidebarDataT => {
    return {
        userProfile,
        team: {
            name: "Estudante",
            logo: () => (
                <Avatar className="size-8">
                    <AvatarImage src="/assets/logos/symbol-white-background.png" />
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
