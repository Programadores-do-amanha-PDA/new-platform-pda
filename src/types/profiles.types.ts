import { ProfileT, RolesT } from ".";

export type GetAllProfilesResult = ProfileT[] | null;

export type GetAllProfilesFilteredByRoleProps = {
    role: RolesT;
};
export type GetAllProfilesFilteredByRoleResult = ProfileT[] | null;

export type GetProfileByIdProps = {
    id: string;
};
export type GetProfileByIdResult = ProfileT | null;

export type CreateProfileProps = {
    profileData: {
        full_name: string;
        email: string;
        user_role: number;
    };
};
export type CreateProfileResult = ProfileT | null;

export type UpdateProfileProps = {
    id: string;
    updates: Partial<{ full_name: string; email: string; user_role: number }>;
};
export type UpdateProfileResult = ProfileT | null;

export type DeleteProfileProps = {
    id: string;
};
export type DeleteProfileResult = boolean;
