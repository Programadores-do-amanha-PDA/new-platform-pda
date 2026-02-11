import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { logger } from "@/lib/logger";
import { getProfileById, createProfile, updateProfile, deleteProfile } from "./actions/profile";
import { Profile } from "./types/profile";

interface UserProfileState {
    profile: Profile | null;
    loading: boolean;
}

/**
 * Actions for managing user profile state.
 *
 * @interface UserProfileActions
 *
 * @property {Function} fetchUserProfile - Asynchronously fetches a user's profile by their ID.
 * @param {Object} params - The parameters object.
 * @param {string} params.userId - The unique identifier of the user to fetch.
 * @returns {Promise<boolean>} A promise that resolves to true if the fetch was successful, false otherwise.
 *
 * @property {Function} setProfile - Updates the current user profile in the store.
 * @param {Profile | null} profile - The profile object to set, or null to clear the profile.
 *
 * @property {Function} setLoading - Updates the loading state of the store.
 * @param {boolean} loading - The loading state to set.
 *
 * @property {Function} reset - Resets all profile-related state to initial values.
 */
/**
 * Defines the actions available for managing user profile state.
 *
 * @interface UserProfileActions
 */
interface UserProfileActions {
    /**
     * Fetches the user profile data from Supabase.
     *
     * @async
     * @param {Object} params - The parameters object
     * @param {string} params.userId - The unique identifier of the user
     * @returns {Promise<boolean>} A promise that resolves to true if the profile was successfully fetched, false otherwise
     * @throws {Error} May throw an error if the API request fails
     */
    fetchUserProfileByIdAsync: ({ id }: { id: string }) => Promise<boolean>;

    /**
     * Sets the user profile data in the store state.
     *
     * @param {Profile | null} profile - The user profile object to set, or null to clear the profile
     * @returns {void}
     */
    setProfile: ({ profile }: { profile: Profile | null }) => void;

    createUserProfileAsync: ({ profileData }: { profileData: Omit<Profile, "updated_at"> }) => Promise<boolean>;

    updateUserProfileAsync: ({ id, updates }: { id: string; updates: Partial<Profile> }) => Promise<boolean>;

    deleteUserProfileByIdAsync: ({ id }: { id: string }) => Promise<boolean>;

    /**
     * Resets the profile store to its initial state.
     *
     * @returns {void}
     */
    reset: () => void;
}

const log = logger.child({ module: "UserProfileStore" });

const UserProfileInitialState: UserProfileState = {
    profile: null,
    loading: false,
};

export const useUserProfileStore = create<UserProfileState & UserProfileActions>()(
    devtools((set) => ({
        ...UserProfileInitialState,

        setProfile: ({ profile }) => {
            set({ profile });
        },

        fetchUserProfileByIdAsync: async ({ id }: { id: string }) => {
            try {
                if (!id) throw new Error("id is required");
                set({ loading: true });

                const { data, error } = await getProfileById({ id });
                if (error) throw error;
                if (!data || !data.profile) throw new Error("Profile not found");

                set({ profile: data.profile });
                return true;
            } catch (error) {
                log.error({ err: error, id, operation: "fetchUserProfileByIdAsync" }, "Failed to fetch user profile");
                set({ profile: null });
                return false;
            } finally {
                set({ loading: false });
            }
        },

        createUserProfileAsync: async ({ profileData }) => {
            try {
                set({ loading: true });

                const { data, error } = await createProfile({
                    profileData,
                });
                if (error) throw error;
                if (!data || !data.profile) throw new Error("Failed to create profile");

                set({ profile: data.profile });
                return true;
            } catch (error) {
                log.error({ err: error, profileData, operation: "createUserProfileAsync" }, "Failed to create user profile");
                return false;
            } finally {
                set({ loading: false });
            }
        },

        updateUserProfileAsync: async ({ id, updates }) => {
            try {
                set({ loading: true });

                const { data, error } = await updateProfile({ id, updates });
                if (error) throw error;
                if (!data || !data.profile) throw new Error("Failed to update profile");

                set({ profile: data.profile });
                return true;
            } catch (error) {
                log.error({ err: error, id, updates, operation: "updateUserProfileAsync" }, "Failed to update user profile");
                return false;
            } finally {
                set({ loading: false });
            }
        },

        deleteUserProfileByIdAsync: async ({ id }) => {
            try {
                set({ loading: true });

                const success = await deleteProfile({ id });
                if (!success) throw new Error("Failed to delete profile");

                set({ profile: null });
                return true;
            } catch (error) {
                log.error({ err: error, id, operation: "deleteUserProfileByIdAsync" }, "Failed to delete user profile");
                return false;
            } finally {
                set({ loading: false });
            }
        },

        reset: () => {
            set(UserProfileInitialState);
        },
    })),
);
