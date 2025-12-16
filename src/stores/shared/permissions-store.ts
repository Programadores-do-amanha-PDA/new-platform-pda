import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { 
  getAllRolePermissions, 
  getPermissionsByRole, 
  insertRolePermission, 
  deleteRolePermission, 
  deleteAllPermissionsForRole 
} from "@/actions/role-permissions";
import { Role, RolePermissionT, PermissionT } from "@/types";

interface PermissionsAdminState {
  allRolePermissions: RolePermissionT[];
  rolePermissions: Record<Role, PermissionT[]>;
  loading: boolean;
  operationLoading: boolean;
}

interface PermissionsAdminActions {
  // Fetch operations
  fetchAllRolePermissions: () => Promise<void>;
  fetchPermissionsForRole: (role: Role) => Promise<void>;
  fetchPermissionsForAllRoles: () => Promise<void>;
  
  // Admin operations
  addPermissionToRole: (role: Role, permission: string) => Promise<boolean>;
  removePermissionFromRole: (role: Role, permission: string) => Promise<boolean>;
  removeAllPermissionsFromRole: (role: Role) => Promise<boolean>;
  
  // Utility functions
  getRolePermissions: (role: Role) => PermissionT[];
  roleHasPermission: (role: Role, permission: string) => boolean;
  roleHasAnyPermission: (role: Role, permissions: string[]) => boolean;
  roleHasAllPermissions: (role: Role, permissions: string[]) => boolean;
  
  // State management
  reset: () => void;
}

const initialState: PermissionsAdminState = {
  allRolePermissions: [],
  rolePermissions: {} as Record<Role, PermissionT[]>,
  loading: false,
  operationLoading: false,
};

export const usePermissionsStore = create<PermissionsAdminState & PermissionsAdminActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchAllRolePermissions: async () => {
        set({ loading: true });
        try {
          const allRolePermissions = await getAllRolePermissions();
          set({ allRolePermissions, loading: false });
        } catch (error) {
          console.error("Error fetching all role permissions:", error);
          set({ allRolePermissions: [], loading: false });
        }
      },

      fetchPermissionsForRole: async (role) => {
        set({ loading: true });
        try {
          const permissions = await getPermissionsByRole(role);
          set(state => ({
            rolePermissions: {
              ...state.rolePermissions,
              [role]: permissions
            },
            loading: false
          }));
        } catch (error) {
          console.error(`Error fetching permissions for role ${role}:`, error);
          set({ loading: false });
        }
      },

      fetchPermissionsForAllRoles: async () => {
        set({ loading: true });
        try {
          const roles: Role[] = ["admin", "employer", "class_manager", "teacher", "student", "alumni"];
          const rolePermissionsPromises = roles.map(async (role) => {
            const permissions = await getPermissionsByRole(role);
            return { role, permissions };
          });

          const results = await Promise.all(rolePermissionsPromises);
          const rolePermissions = results.reduce((acc, { role, permissions }) => {
            acc[role] = permissions;
            return acc;
          }, {} as Record<Role, PermissionT[]>);

          set({ rolePermissions, loading: false });
        } catch (error) {
          console.error("Error fetching permissions for all roles:", error);
          set({ loading: false });
        }
      },

      addPermissionToRole: async (role, permission) => {
        set({ operationLoading: true });
        try {
          const result = await insertRolePermission(role, permission);
          if (result) {
            // Update local state
            set(state => ({
              rolePermissions: {
                ...state.rolePermissions,
                [role]: [...(state.rolePermissions[role] || []), permission]
              },
              operationLoading: false
            }));
            return true;
          }
          set({ operationLoading: false });
          return false;
        } catch (error) {
          console.error("Error adding permission to role:", error);
          set({ operationLoading: false });
          return false;
        }
      },

      removePermissionFromRole: async (role, permission) => {
        set({ operationLoading: true });
        try {
          const result = await deleteRolePermission(role, permission);
          if (result) {
            // Update local state
            set(state => ({
              rolePermissions: {
                ...state.rolePermissions,
                [role]: (state.rolePermissions[role] || []).filter(p => p !== permission)
              },
              operationLoading: false
            }));
            return true;
          }
          set({ operationLoading: false });
          return false;
        } catch (error) {
          console.error("Error removing permission from role:", error);
          set({ operationLoading: false });
          return false;
        }
      },

      removeAllPermissionsFromRole: async (role) => {
        set({ operationLoading: true });
        try {
          const result = await deleteAllPermissionsForRole(role);
          if (result) {
            // Update local state
            set(state => ({
              rolePermissions: {
                ...state.rolePermissions,
                [role]: []
              },
              operationLoading: false
            }));
            return true;
          }
          set({ operationLoading: false });
          return false;
        } catch (error) {
          console.error("Error removing all permissions from role:", error);
          set({ operationLoading: false });
          return false;
        }
      },

      getRolePermissions: (role) => {
        const { rolePermissions } = get();
        return rolePermissions[role] || [];
      },

      roleHasPermission: (role, permission) => {
        const { rolePermissions } = get();
        const permissions = rolePermissions[role] || [];
        return permissions.includes(permission);
      },

      roleHasAnyPermission: (role, permissions) => {
        const { rolePermissions } = get();
        const rolePerms = rolePermissions[role] || [];
        return permissions.some(permission => rolePerms.includes(permission));
      },

      roleHasAllPermissions: (role, permissions) => {
        const { rolePermissions } = get();
        const rolePerms = rolePermissions[role] || [];
        return permissions.every(permission => rolePerms.includes(permission));
      },

      reset: () => {
        set({ ...initialState });
      },
    }),
    { name: "PermissionsAdminStore" }
  )
);