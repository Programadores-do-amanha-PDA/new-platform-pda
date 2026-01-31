import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRole } from "@/features/auth/access-control/types";
import { SidebarDataT } from "@/types";
import { rolesLabelsOptions } from "@/features/auth/access-control/utils";
import { Profile } from "@/features/users/profile";

export const generateNoAccessSidebarConfig = (userProfile: Profile, userRole?: UserRole | null): SidebarDataT => {
    const getUserRoleLabel = () => {
        if (!userRole) {
            return "Usuário";
        }

        const roleOption = rolesLabelsOptions.find((option) => option.value === userRole.role);
        return roleOption?.label || "Usuário";
    };

    return {
        userProfile,
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
