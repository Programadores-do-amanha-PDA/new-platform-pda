import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useUsersStore } from "./users-store";
import { useRolesStore } from "./user-roles-store";
import { AuthUserWithProfileT, RolesT } from "@/types/auth";
import { UserClassroomT } from "@/types/auth/user-classroom";
import { AuthUser } from "@supabase/supabase-js";
import { useUserClassroomsStore } from "./user-classrooms-store";

/**
 * Combined store that provides access to all user-related functionality
 * This store doesn't duplicate state but provides a unified API to access
 * all user-related operations from the individual stores
 */
interface UsersCombinedState {
  // Getters for accessing state from individual stores
  getUsers: () => Partial<AuthUserWithProfileT>[];
  isLoading: () => boolean;
}

interface UsersCombinedActions {
  // User management actions
  getAllUsersWithProfiles: (role?: RolesT) => Promise<boolean>;
  createNewUser: (
    userData: Partial<AuthUser & { password: string }>
  ) => Promise<string | false>;
  updateUser: (
    userID: string | undefined,
    updates: Partial<AuthUser & { password: string }>
  ) => Promise<boolean>;
  deleteUser: (userId: string | undefined) => Promise<boolean>;

  // User classroom actions
  createUserClassrooms: (usersClassrooms: UserClassroomT[]) => Promise<boolean>;
  deleteUserClassroom: (
    userId: string,
    classroomsIds: string[]
  ) => Promise<boolean>;

  // User role actions
  addUserRole: (userId: string, role: RolesT) => Promise<boolean>;
  updateUserRole: (userId: string, role: RolesT) => Promise<boolean>;
  deleteUserRole: (userId: string) => Promise<boolean>;

  // Reset all stores
  resetAll: () => void;
}

export const useUsersCombinedStore = create<
  UsersCombinedState & UsersCombinedActions
>()(
  devtools(
    () => ({
      // Getters
      getUsers: () => useUsersStore.getState().users,
      isLoading: () =>
        useUsersStore.getState().loading ||
        useUserClassroomsStore.getState().loading,

      // User management actions
      getAllUsersWithProfiles: async (role?: RolesT) => {
        const success = await useUsersStore
          .getState()
          .getAllUsersWithProfiles(role);
        if (success) {
          // Sync users data with the classrooms store
          const users = useUsersStore.getState().users;
          useUserClassroomsStore.getState().setUsers(users);
        }
        return success;
      },

      createNewUser: async (userData) => {
        return useUsersStore.getState().createNewUser(userData);
      },

      updateUser: async (userID, updates) => {
        return useUsersStore.getState().updateUser(userID, updates);
      },

      deleteUser: async (userId) => {
        return useUsersStore.getState().deleteUser(userId);
      },

      // User classroom actions
      createUserClassrooms: async (usersClassrooms) => {
        const success = await useUserClassroomsStore
          .getState()
          .createUserClassrooms(usersClassrooms);
        if (success) {
          // Sync updated classroom data back to users store
          const updatedUsers = useUserClassroomsStore.getState().users;
          useUsersStore.getState().setUsers(updatedUsers);
        }
        return success;
      },

      deleteUserClassroom: async (userId, classroomsIds) => {
        const success = await useUserClassroomsStore
          .getState()
          .deleteUserClassroom(userId, classroomsIds);
        if (success) {
          // Sync updated classroom data back to users store
          const updatedUsers = useUserClassroomsStore.getState().users;
          useUsersStore.getState().setUsers(updatedUsers);
        }
        return success;
      },

      // User role actions
      addUserRole: async (userId, role) => {
        return useRolesStore.getState().addUserRole(userId, role);
      },

      updateUserRole: async (userId, role) => {
        return useRolesStore.getState().updateUserRole(userId, role);
      },

      deleteUserRole: async (userId) => {
        return useRolesStore.getState().deleteUserRole(userId);
      },

      // Reset all stores
      resetAll: () => {
        useUsersStore.getState().reset();
        useUserClassroomsStore.getState().reset();
      },
    }),
    { name: "UsersCombinedStore" }
  )
);
