import { Suspense, lazy, useMemo } from "react";
import {useAuth} from "@/features/shared/auth";

export const STACK_PROVIDERS_BY_ROLE = {
    admin: lazy(() => import("./roles/admin/stack-provider").then((mod) => ({ default: mod.AdminStackProvider }))),
    employer: lazy(() => import("./roles/employer/stack-provider").then((mod) => ({ default: mod.EmployerStackProvider }))),
    student: lazy(() => import("./roles/student/stack-provider").then((mod) => ({ default: mod.StudentStackProvider }))),
};

export default function StackProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const { user } = useAuth();

    const userRole = useMemo(() => user?.profile.user_role.role, [user]);

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
