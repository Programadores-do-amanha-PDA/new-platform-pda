import { UserRole, Role } from "./roles";

// Get All User Roles
export type GetAllUserRolesResult = UserRole[] | null;

// Insert User Role
export type InsertUserRoleProps = {
    userId: string;
    role: Role;
};
export type InsertUserRoleResult = UserRole[] | null;

// Update User Role
export type UpdateUserRoleProps = {
    userId: string;
    newRole: Role;
};
export type UpdateUserRoleResult = UserRole[] | null;

// Delete User Role
export type DeleteUserRoleProps = {
    userId: string;
};
export type DeleteUserRoleResult = boolean;

// Get User Role
export type GetUserRoleResult = string | null;
