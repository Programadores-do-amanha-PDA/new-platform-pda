import { Suspense, lazy, useMemo } from "react";
import { useAuth } from "@/features/auth/shared";
import { useUserRoleStore } from "@/features/auth/access-control/stores";

export const STACK_PROVIDERS_BY_ROLE = {
    admin: lazy(() => import("./roles/admin/stack-provider").then((mod) => ({ default: mod.AdminStackProvider }))),
    employer: lazy(() => import("./roles/employer/stack-provider").then((mod) => ({ default: mod.EmployerStackProvider }))),
    student: lazy(() => import("./roles/student/stack-provider").then((mod) => ({ default: mod.StudentStackProvider }))),
};

export default function StackProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const { user } = useAuth();
    const { userRole: userRoleData } = useUserRoleStore();

    const userRole = useMemo(() => userRoleData?.role, [userRoleData]);

    if (!user || !userRole) {
        return null;
    }

    const StackProviderComponent = STACK_PROVIDERS_BY_ROLE[userRole as keyof typeof STACK_PROVIDERS_BY_ROLE];

    if (StackProviderComponent) {
        return (
            <Suspense fallback={null}>
                <StackProviderComponent>{children}</StackProviderComponent>
            </Suspense>
        );
    }

    return null;
}
