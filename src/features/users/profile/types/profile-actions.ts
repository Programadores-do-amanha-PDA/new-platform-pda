import { AuthError } from "@supabase/supabase-js";
import { Role } from "@/features/auth/access-control/types";
import { Profile } from "./profile";

export type GetAllProfilesProps = {
    role?: Role;
};
export type GetAllProfilesResult = { data: { profiles: Profile[] }; error: null } | { data: null; error: string };

export type GetProfileByIdProps = {
    id: string;
};
export type GetProfileByIdResult = { data: { profile: Profile }; error: null } | { data: null; error: string };

export type CreateProfileProps = {
    profileData: Partial<Omit<Profile, "created_at" | "id">>;
};
export type CreateProfileResult = { data: { profile: Profile }; error: null } | { data: null; error: Error | AuthError };

export type UpdateProfileProps = {
    id: string;
    updates: Partial<Omit<Profile, "created_at" | "id">>;
};
export type UpdateProfileResult = { data: { profile: Profile }; error: null } | { data: null; error: Error | AuthError };

export type DeleteProfileProps = {
    id: string;
};
export type DeleteProfileResult = { data: { deletedUserId: string }; error: null } | { data: null; error: Error | AuthError };
