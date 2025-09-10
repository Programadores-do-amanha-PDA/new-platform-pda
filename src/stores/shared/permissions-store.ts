import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { 
  getAllRolePermissions, 
  getPermissionsByRole, 
  insertRolePermission, 
  deleteRolePermission, 
  deleteAllPermissionsForRole 
} from "@/app/actions/role-permissions";
import { RolesT, RolePermissionT, PermissionT } from "@/types";

interface PermissionsAdminState {
  allRolePermissions: RolePermissionT[];
  rolePermissions: Record<RolesT, PermissionT[]>;
  loading: boolean;
  operationLoading: boolean;
}

interface PermissionsAdminActions {
  // Fetch operations
  fetchAllRolePermissions: () => Promise<void>;
  fetchPermissionsForRole: (role: RolesT) => Promise<void>;
  fetchPermissionsForAllRoles: () => Promise<void>;
  
  // Admin operations
  addPermissionToRole: (role: RolesT, permission: string) => Promise<boolean>;
  removePermissionFromRole: (role: RolesT, permission: string) => Promise<boolean>;
  removeAllPermissionsFromRole: (role: RolesT) => Promise<boolean>;
  
  // Utility functions
  getRolePermissions: (role: RolesT) => PermissionT[];
  roleHasPermission: (role: RolesT, permission: string) => boolean;
  roleHasAnyPermission: (role: RolesT, permissions: string[]) => boolean;
  roleHasAllPermissions: (role: RolesT, permissions: string[]) => boolean;
  
  // State management
  reset: () => void;
}

const initialState: PermissionsAdminState = {
  allRolePermissions: [],
  rolePermissions: {} as Record<RolesT, PermissionT[]>,
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
          const roles: RolesT[] = ["admin", "employer", "class_manager", "teacher", "student", "alumni"];
          const rolePermissionsPromises = roles.map(async (role) => {
            const permissions = await getPermissionsByRole(role);
            return { role, permissions };
          });

          const results = await Promise.all(rolePermissionsPromises);
          const rolePermissions = results.reduce((acc, { role, permissions }) => {
            acc[role] = permissions;
            return acc;
          }, {} as Record<RolesT, PermissionT[]>);

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