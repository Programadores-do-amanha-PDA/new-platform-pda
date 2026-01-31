"use client";


import { useUsersStore } from "@/features/users/management";
import { BaseStackProvider } from "../../shared/base-stack-provider";
import { RolesLabels } from "@/features/auth/access-control/types";

interface EmployerStackProviderProps {
    children: React.ReactNode;
    loadInitialData?: boolean;
}

export const EmployerStackProvider = ({ children, loadInitialData = true }: EmployerStackProviderProps) => {
    const usersStore = useUsersStore();

    const handleLoadData = async () => {
        await Promise.all([usersStore.fetchAllUsersWithProfiles({})]);
    };

    const getFeaturesData = () => ({});

    return (
        <BaseStackProvider
            allowedRoles={[RolesLabels.EMPLOYER]}
            loadInitialData={loadInitialData}
            onLoadData={handleLoadData}
            getFeaturesData={getFeaturesData}
        >
            {children}
        </BaseStackProvider>
    );
};
