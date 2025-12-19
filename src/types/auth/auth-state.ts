import { Permission, Role } from ".";
import { AuthUserWithProfile } from "@/features/dashboard/shared/profile";

export interface AuthState {
    user: AuthUserWithProfile | null;
    permissions: Permission[];
    loading: boolean;
}

export interface AuthActions {
    setUser: (user: AuthUserWithProfile | null) => void;
    setPermissions: (permissions: Permission[]) => void;
    fetchUserProfile: (jwt: string) => Promise<void>;
    fetchUserPermissions: (role: Role) => Promise<void>;
    updateAuthState: (session: { access_token: string } | null) => Promise<void>;
    fetchSession: () => Promise<void>;
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
    reset: () => void;
}
