"use client";


import { useUsersStore } from "@/features/dashboard/shared/users";
import { BaseStackProvider } from "../../shared/base-stack-provider";

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
            allowedRoles={["employer"]}
            loadInitialData={loadInitialData}
            onLoadData={handleLoadData}
            getFeaturesData={getFeaturesData}
        >
            {children}
        </BaseStackProvider>
    );
};
