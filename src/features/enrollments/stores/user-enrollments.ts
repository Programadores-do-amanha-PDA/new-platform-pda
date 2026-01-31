"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { Enrollment } from "../types";

/**
 * State for the current authenticated user's enrollments.
 */
interface UserEnrollmentsState {
    readonly enrollments: Enrollment[];
    readonly loading: boolean;
}

/**
 * Actions for managing the current user's enrollments state.
 */
interface UserEnrollmentsActions {
    /**
     * Sets the current user's enrollments.
     * @param enrollments - The enrollments array to set.
     */
    setEnrollments: (enrollments: Enrollment[]) => void;

    /**
     * Resets the store to initial state.
     */
    reset: () => void;
}

const initialState: UserEnrollmentsState = {
    enrollments: [],
    loading: false,
};

/**
 * Zustand store for managing the current authenticated user's enrollments.
 */
export const useUserEnrollmentsStore = create<UserEnrollmentsState & UserEnrollmentsActions>()(
    devtools(
        (set) => ({
            ...initialState,

            setEnrollments: (enrollments) => {
                set({ enrollments });
            },

            reset: () => {
                set(initialState);
            },
        }),
        { name: "UserEnrollmentsStore" },
    ),
);
