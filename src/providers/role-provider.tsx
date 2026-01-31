"use client";

import { createContext, useContext, ReactNode } from "react";

import AppBar from "@/components/shared/app-bar";
import { AppSidebar } from "@/components/shared/sidebar";
import PageLoader from "@/components/shared/page-loader";
import NoAccessPage from "@/components/shared/empty-states/no-access-page";
import { useAuth } from "@/features/auth/shared";
import { useUserRoleStore } from "@/features/auth/access-control/stores";

import StackProvider from "./stack-provider";
import pathLabels from "@/utils/path-labels";
import { SidebarDataT } from "@/types/sidebar";
import { generateNoAccessSidebarConfig } from "./stack-provider/roles/no-acess";
import { useUserProfileStore } from "@/features/users/profile";


interface RoleProviderProps {
    children: ReactNode;
}

const RoleContext = createContext({});

export const RoleProvider = ({ children }: RoleProviderProps) => {
    const { userRole } = useAuth();
    const { profile } = useUserProfileStore();
    const { userRole: userRoleData } = useUserRoleStore();

    if (!profile || !userRole) {
        return (
            <div className="flex justify-center items-center w-screen h-screen">
                <PageLoader />
            </div>
        );
    }

    if (userRole && typeof userRole === "string") {
        return <StackProvider>{children}</StackProvider>;
    }

    // Fallback para roles não reconhecidas
    const sidebarData: SidebarDataT = generateNoAccessSidebarConfig(profile, userRoleData);
    return (
        <>
            <AppSidebar data={sidebarData} />
            <div className="relative flex flex-col bg-background shadow ml-1 rounded-lg! w-full h-full overflow-hidden">
                <AppBar pathLabels={pathLabels} />
                <div className="flex flex-col gap-10 w-full h-full overflow-hidden">
                    <NoAccessPage />
                </div>
            </div>
        </>
    );
};

export const useRoleContext = () => useContext(RoleContext);
