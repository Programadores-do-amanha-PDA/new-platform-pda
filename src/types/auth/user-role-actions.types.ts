import { RolesT, UserRoleT } from "./user-role";

// Get All User Roles
export type GetAllUserRolesResult = UserRoleT[] | null;

// Insert User Role
export type InsertUserRoleProps = {
    userId: string;
    role: RolesT;
};
export type InsertUserRoleResult = UserRoleT[] | null;

// Update User Role
export type UpdateUserRoleProps = {
    userId: string;
    newRole: RolesT;
};
export type UpdateUserRoleResult = UserRoleT[] | null;

// Delete User Role
export type DeleteUserRoleProps = {
    userId: string;
};
export type DeleteUserRoleResult = boolean;

// Get User Role
export type GetUserRoleResult = string | null;