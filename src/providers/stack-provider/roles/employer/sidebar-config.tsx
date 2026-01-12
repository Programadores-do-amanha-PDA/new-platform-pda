"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { AuthUserWithProfile } from "@/features/dashboard/profile";
import { SidebarDataT } from "@/types";
import pathLabels from "@/utils/path-labels";

export const generateSidebarConfig = (user: AuthUserWithProfile): SidebarDataT => {
    return {
        user,
        team: {
            name: "Empregabilidade",
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
            {
              title: pathLabels["jobs"],
              url: "/dashboard/jobs",
              ref: "jobs",
              icon: "Briefcase",
              isActive: false,
              items: [
                {
                  title: pathLabels["curated"],
                  url: "/dashboard/jobs/curated",
                },
                {
                  title: pathLabels["curation"],
                  url: "/dashboard/jobs/curation",
                },
                {
                  title: pathLabels["archives"],
                  url: "/dashboard/jobs/archives",
                },
              ],
            },
        ],
        projects: [],
    };
};



