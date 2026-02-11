import { UserAttributes, UserMetadata } from "@supabase/supabase-js";
import { Profile } from "../types/profile";
import { ProfileFormSchemaT } from "../types/profile-form";


/**
 * Builds user data object for profile update.
 * Updates auth.users which automatically syncs to profiles table via user_metadata.
 */
export const buildUserUpdateData = ({
    formData,
    currentUser,
}: {
    formData: ProfileFormSchemaT;
    currentUser: Profile;
}): Partial<UserAttributes & { password: string }> => {
    const userData: Partial<UserAttributes & { password: string }> = {};

    if (formData.email !== currentUser.email) {
        userData.email = formData.email;
    }

    if (formData.newPassword && formData.confirmNewPassword && formData.newPassword === formData.confirmNewPassword) {
        userData.password = formData.newPassword;
    }

    const userMetadata: UserMetadata = {};

    if (formData.fullName !== currentUser.full_name) {
        userMetadata.full_name = formData.fullName;
    }

    if (formData.bio && formData.bio !== currentUser.bio) {
        userMetadata.bio = formData.bio;
    }

    if (formData.email !== currentUser.email) {
        userMetadata.user_email = formData.email;
    }

    if (Object.keys(userMetadata).length > 0) {
        userData.data = userMetadata;
    }

    return userData;
};

/**
 * Checks if email is being changed
 */
export const isValueChanged = ({ currentValue, newValue }: { currentValue: string; newValue: string | undefined }): boolean => {
    return currentValue !== newValue;
};
