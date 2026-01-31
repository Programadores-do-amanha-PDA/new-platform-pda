import { Role, Permission, RolePermission } from "../../types";

export type FetchAllRolePermissionsForRoleProps = {
    readonly role: Role;
};

export type AddPermissionToRoleProps = {
    readonly role: Role;
    readonly permission: string;
};

type RemovePermissionFromRoleProps = {
    readonly role: Role;
    readonly permission: string;
};

export type RemoveAllPermissionsFromRoleProps = {
    readonly role: Role;
};

export type GetRolePermissionsProps = {
    readonly role: Role;
};

export type RoleHasPermissionProps = {
    readonly role: Role;
    readonly permission: string;
};

export type RoleHasAnyPermissionProps = {
    readonly role: Role;
    readonly permissions: readonly string[];
};

export type RoleHasAllPermissionsProps = {
    readonly role: Role;
    readonly permissions: readonly string[];
};

export interface PermissionsActions {
    fetchAllRolePermissions: () => Promise<boolean>;
    fetchPermissionsForRole: (props: FetchAllRolePermissionsForRoleProps) => Promise<boolean>;
    fetchPermissionsForAllRoles: () => Promise<boolean>;
    addPermissionToRole: (props: AddPermissionToRoleProps) => Promise<boolean>;
    removePermissionFromRole: (props: RemovePermissionFromRoleProps) => Promise<boolean>;
    removeAllPermissionsFromRole: (props: RemoveAllPermissionsFromRoleProps) => Promise<boolean>;
    getRolePermissions: (props: GetRolePermissionsProps) => Permission[];
    roleHasPermission: (props: RoleHasPermissionProps) => boolean;
    roleHasAnyPermission: (props: RoleHasAnyPermissionProps) => boolean;
    roleHasAllPermissions: (props: RoleHasAllPermissionsProps) => boolean;
    reset: () => void;
}

export interface PermissionsState {
    readonly allRolePermissions: RolePermission[];
    readonly rolePermissions: Record<Role, Permission[]>;
    readonly loading: boolean;
    readonly operationLoading: boolean;
}