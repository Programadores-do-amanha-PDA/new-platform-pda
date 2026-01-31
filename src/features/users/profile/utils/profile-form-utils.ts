// Global imports
import { UserAttributes, UserMetadata } from "@supabase/supabase-js";

// Local imports
import { User, ProfileFormSchemaT } from "../types";

/**
 * Builds user data object for profile update
 */
export const buildUserUpdateData = ({
    formData,
    currentUser,
}: {
    formData: ProfileFormSchemaT;
    currentUser: User;
}): Partial<UserAttributes & { password: string }> => {
    const userData: Partial<UserAttributes & { password: string }> = {};

    if (formData.email !== currentUser.email) {
        userData.email = formData.email;
    }

    if (formData.newPassword && formData.confirmNewPassword && formData.newPassword === formData.confirmNewPassword) {
        userData.password = formData.newPassword;
    }

    const userMetadata: UserMetadata = {};

    if (formData.fullName !== currentUser.profile?.full_name) {
        userMetadata.full_name = formData.fullName;
    }

    if (formData.bio && formData.bio !== currentUser.profile?.bio) {
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
