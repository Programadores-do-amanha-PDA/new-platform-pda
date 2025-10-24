// Local imports
import { AuthUserWithProfileT, PermissionT, RolesT } from ".";

export interface AuthStateT {
  user: AuthUserWithProfileT | null;
  userRole: RolesT | null;
  permissions: PermissionT[];
  loading: boolean;
}

export interface AuthActionsT {
  setUser: (user: AuthUserWithProfileT | null) => void;
  setUserRole: (role: RolesT | null) => void;
  setPermissions: (permissions: PermissionT[]) => void;
  getUserProfile: (jwt: string) => Promise<void>;
  fetchUserPermissions: (role: RolesT) => Promise<void>;
  updateAuthState: (session: { access_token: string } | null) => Promise<void>;
  fetchSession: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  reset: () => void;
}
