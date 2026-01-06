import { Role } from "@/types";
import { Profile } from "./profile";

export type GetAllProfilesResult = Profile[] | null;

export type GetAllProfilesFilteredByRoleProps = {
    role: Role;
};
export type GetAllProfilesFilteredByRoleResult = Profile[] | null;

export type GetProfileByIdProps = {
    id: string;
};
export type GetProfileByIdResult = Profile | null;

export type CreateProfileProps = {
    profileData: {
        full_name: string;
        email: string;
        user_role: number;
    };
};
export type CreateProfileResult = Profile | null;

export type UpdateProfileProps = {
    id: string;
    updates: Partial<{ full_name: string; email: string; user_role: number }>;
};
export type UpdateProfileResult = Profile | null;

export type DeleteProfileProps = {
    id: string;
};
export type DeleteProfileResult = boolean;
