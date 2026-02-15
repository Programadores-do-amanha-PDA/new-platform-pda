import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

import { logger } from "@/lib/logger";

import { Role, UserRole } from "../../types";
import {
    getAllUserRolesAsync,
    insertUserRoleWithUserIdAsync,
    updateUserRoleWithUserIdAsync,
    deleteUserRoleWithUserIdAsync,
} from "../../actions/user-role";

const log = logger.child({ module: "UserRolesManagementStore" });

/**
 * Map of user roles keyed by user ID.
 * Provides O(1) lookup for user roles.
 */
type UsersRolesMap = Record<string, Role>;

interface AddUserRoleProps {
    readonly userId: string;
    readonly role: Role;
}

interface UpdateUserRoleProps {
    readonly userId: string;
    readonly role: Role;
}

interface DeleteUserRoleProps {
    readonly userId: string;
}

interface SetUsersRolesProps {
    readonly usersRoles: UsersRolesMap;
}

interface SetUserRoleProps {
    readonly userId: string;
    readonly role: Role;
}

interface UserRolesManagementState {
    /** Map of user roles keyed by user ID */
    readonly usersRoles: UsersRolesMap;
    /** Loading state for async operations */
    readonly isLoading: boolean;
}

interface UserRolesManagementActions {
    /** Fetches all user roles from the server and populates the store */
    fetchAllUserRolesAsync: () => Promise<void>;
    /** Sets the entire users roles map */
    setUsersRoles: (props: SetUsersRolesProps) => void;
    /** Sets a single user's role in the store (local only, no API call) */
    setUserRole: (props: SetUserRoleProps) => void;
    /** Gets a user's role by ID */
    getUserRoleById: (userId: string) => Role | undefined;
    /** Adds a new role to a user (API + store update) */
    addUserRole: (props: AddUserRoleProps) => Promise<boolean>;
    /** Updates a user's role (API + store update) */
    updateUserRole: (props: UpdateUserRoleProps) => Promise<boolean>;
    /** Removes a user's role (API + store update) */
    deleteUserRole: (props: DeleteUserRoleProps) => Promise<boolean>;
    /** Clears all user roles from the store */
    clearUsersRoles: () => void;
}

type UserRolesManagementStore = UserRolesManagementState & UserRolesManagementActions;

/**
 * Converts an array of UserRole objects to a UsersRolesMap.
 * @param userRoles Array of UserRole objects from the API.
 * @returns A map of user roles keyed by user ID.
 */
const convertUserRolesToMap = (userRoles: UserRole[]): UsersRolesMap => {
    return userRoles.reduce<UsersRolesMap>((acc, userRole) => {
        if (userRole.user_id) {
            acc[userRole.user_id] = userRole.role;
        }
        return acc;
    }, {});
};

/**
 * Zustand store for managing user roles (admin operations on other users).
 * Centralizes all user roles data in a map keyed by user ID for efficient lookups.
 */
export const useUserRolesManagementStore = create<UserRolesManagementStore>()(
    devtools(
        (set, get) => ({
            // Initial state
            usersRoles: {},
            isLoading: false,

            /**
             * Fetches all user roles from the server and populates the store.
             */
            fetchAllUserRolesAsync: async () => {
                try {
                    set({ isLoading: true });
                    const userRoles = await getAllUserRolesAsync();

                    if (!userRoles) {
                        log.warn({ operation: "fetchAllUserRolesAsync" }, "No user roles returned from server");
                        return;
                    }

                    const usersRolesMap = convertUserRolesToMap(userRoles);
                    set({ usersRoles: usersRolesMap });

                    log.info({ count: Object.keys(usersRolesMap).length }, "User roles fetched successfully");
                } catch (error) {
                    log.error({ err: error, operation: "fetchAllUserRolesAsync" }, "Failed to fetch user roles");
                } finally {
                    set({ isLoading: false });
                }
            },

            /**
             * Sets the entire users roles map.
             * @param usersRoles The new users roles map.
             */
            setUsersRoles: ({ usersRoles }) => {
                set({ usersRoles });
            },

            /**
             * Sets a single user's role in the store (local only, no API call).
             * @param userId User ID.
             * @param role Role to set.
             */
            setUserRole: ({ userId, role }) => {
                const { usersRoles } = get();
                set({
                    usersRoles: {
                        ...usersRoles,
                        [userId]: role,
                    },
                });
            },

            /**
             * Gets a user's role by ID.
             * @param userId User ID.
             * @returns The user's role or undefined if not found.
             */
            getUserRoleById: (userId: string) => {
                return get().usersRoles[userId];
            },

            /**
             * Adds a new role to a user.
             * @param userId User ID.
             * @param role Role to be added.
             * @returns true if successful, false otherwise.
             */
            addUserRole: async ({ userId, role }) => {
                try {
                    if (!userId) {
                        log.warn({ operation: "addUserRole" }, "User ID is required");
                        toast.error("O ID do usuário é obrigatório.");
                        return false;
                    }
                    if (!role) {
                        log.warn({ operation: "addUserRole" }, "Role is required");
                        toast.error("O cargo é obrigatório.");
                        return false;
                    }

                    const response = await insertUserRoleWithUserIdAsync({ userId, role });
                    if (!response) throw new Error("no insert user role response");

                    // Update the local store
                    const { usersRoles } = get();
                    set({
                        usersRoles: {
                            ...usersRoles,
                            [userId]: role,
                        },
                    });

                    toast.success("Cargo adicionado com sucesso!");
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error({ err: error, userId, role, operation: "addUserRole" }, "Error adding user role");
                    }
                    toast.error("Falha ao adicionar o cargo ao usuário.");
                    return false;
                }
            },

            /**
             * Updates a user's role.
             * @param userId User ID.
             * @param role New role.
             * @returns true if successful, false otherwise.
             */
            updateUserRole: async ({ userId, role }) => {
                try {
                    if (!userId) {
                        log.warn({ operation: "updateUserRole" }, "User ID is required");
                        toast.error("O ID do usuário é obrigatório.");
                        return false;
                    }
                    if (!role) {
                        log.warn({ operation: "updateUserRole" }, "Role is required");
                        toast.error("O cargo é obrigatório.");
                        return false;
                    }

                    const responseData = await updateUserRoleWithUserIdAsync({ userId, newRole: role });
                    if (!responseData) throw new Error("no update user role response");

                    // Update the local store
                    const { usersRoles } = get();
                    set({
                        usersRoles: {
                            ...usersRoles,
                            [userId]: role,
                        },
                    });

                    toast.success("Cargo atualizado com sucesso!");
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error({ err: error, userId, role, operation: "updateUserRole" }, "Error updating user role");
                    }
                    toast.error("Falha ao atualizar o cargo do usuário.");
                    return false;
                }
            },

            /**
             * Removes a user's role.
             * @param userId User ID.
             * @returns true if successful, false otherwise.
             */
            deleteUserRole: async ({ userId }) => {
                try {
                    if (!userId) {
                        log.warn({ operation: "deleteUserRole" }, "User ID is required");
                        toast.error("User ID is required.");
                        return false;
                    }

                    const responseData = await deleteUserRoleWithUserIdAsync({ userId });
                    if (!responseData) throw new Error("no delete user role response");

                    // Remove from local store using immutable pattern
                    const { usersRoles } = get();
                    const updatedRoles = Object.fromEntries(Object.entries(usersRoles).filter(([key]) => key !== userId));
                    set({ usersRoles: updatedRoles });

                    toast.success("Cargo removido com sucesso!");
                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error({ err: error, userId, operation: "deleteUserRole" }, "Error deleting user role");
                    }
                    toast.error("Falha ao remover o cargo do usuário.");
                    return false;
                }
            },

            /**
             * Clears all user roles from the store.
             */
            clearUsersRoles: () => {
                set({ usersRoles: {} });
            },
        }),
        { name: "UserRolesManagementStore" },
    ),
);
