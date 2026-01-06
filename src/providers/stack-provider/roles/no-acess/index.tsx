import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthUserWithProfile } from "@/features/dashboard/profile";
import { SidebarDataT } from "@/types";
import { rolesLabelsOptions } from "@/utils";

export const generateNoAccessSidebarConfig = (user: AuthUserWithProfile): SidebarDataT => {
    const getUserRoleLabel = () => {
        if (!user?.profile.user_role) {
            return "Usuário";
        }

        const userRole = user?.profile.user_role.role;
        const roleOption = rolesLabelsOptions.find((option) => option.value === userRole);
        return roleOption?.label || "Usuário";
    };

    return {
        user,
        team: {
            name: getUserRoleLabel(),
            logo: () => (
                <Avatar className="size-8">
                    <AvatarImage src="/assets/logos/symbol-white-background.png" />
                    <AvatarFallback>PdA</AvatarFallback>
                </Avatar>
            ),
        },
    };
};
