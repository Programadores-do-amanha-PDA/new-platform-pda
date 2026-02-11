"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { UserRole } from "@/features/auth/access-control/types";

/**
 * State for the current authenticated user's role.
 */
interface UserRoleState {
    readonly userRole: UserRole | null;
    readonly loading: boolean;
}

/**
 * Actions for managing the current user's role state.
 */
interface UserRoleActions {
    /**
     * Sets the current user's role.
     * @param userRole - The user role to set, or null to clear.
     */
    setUserRole: (userRole: UserRole | null) => void;

    /**
     * Resets the store to initial state.
     */
    reset: () => void;
}

const initialState: UserRoleState = {
    userRole: null,
    loading: false,
};

/**
 * Zustand store for managing the current authenticated user's role.
 */
export const useUserRoleStore = create<UserRoleState & UserRoleActions>()(
    devtools(
        (set) => ({
            ...initialState,

            setUserRole: (userRole) => {
                set({ userRole });
            },

            reset: () => {
                set(initialState);
            },
        }),
        { name: "UserRoleStore" },
    ),
);
