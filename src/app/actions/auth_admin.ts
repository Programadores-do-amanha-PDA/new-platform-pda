"use server";
import { AuthUser } from "@supabase/supabase-js";
import {
  getAllProfiles,
  getAllProfilesFilteredByRole,
} from "@/app/actions/profiles";
import { createClientAdmin } from "@/lib/supabase/server";
import { AuthUserWithProfileT, ProfileT, RolesT } from "@/types/auth";

export const getAllUsers = async (role?: RolesT) => {
  try {
    const supabase = await createClientAdmin();
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers({ perPage: 10000 });

    if (error) throw error;

    if (!role) {
      const profiles = await getAllProfiles();
      if (!profiles) throw new Error("no users profile response");

      const usersWithPossibleProfiles = users.map((user) => {
        const profile = profiles.find(
          (profile: ProfileT) => profile.id === user.id
        );
        return { user, profile };
      });

      const usersWithProfiles: AuthUserWithProfileT[] =
        usersWithPossibleProfiles
          .filter(({ profile }) => profile !== undefined)
          .map(({ user, profile }) => ({ ...user, profile: profile! }))
          .sort((a, b) => (a.created_at > b.created_at ? 1 : -1));

      return usersWithProfiles;
    } else if (role) {
      const filteredProfiles = await getAllProfilesFilteredByRole(role);

      if (!users || !filteredProfiles) {
        throw new Error(`Users or profiles for role ${role} is not available`);
      }

      const allFilteredUsers: AuthUserWithProfileT[] = filteredProfiles
        .map((profile) => {
          const user = users?.find((p) => p.id === profile.id);
          if (user) {
            return {
              ...user,
              profile,
            };
          }
          return null;
        })
        .filter((user): user is AuthUserWithProfileT => user !== null)
        .sort((a, b) => (a.created_at > b.created_at ? 1 : -1));

      return allFilteredUsers as AuthUserWithProfileT[];
    }
  } catch (error) {
    console.error("Error fetching all auth users:", error);
    return false;
  }
};

export const getUserByID = async (userId: string) => {
  try {
    const supabase = await createClientAdmin();
    const {
      data: { user },
      error,
    } = await supabase.auth.admin.getUserById(userId);

    if (error) throw error;

    return user as AuthUser;
  } catch (error) {
    console.error("Error fetching all auth users:", error);
    return false;
  }
};

export const createUser = async (userData: Partial<AuthUser>) => {
  try {
    const supabase = await createClientAdmin();

    const {
      data: { user },
      error,
    } = await supabase.auth.admin.createUser(userData);

    if (error) throw error;

    return user;
  } catch (error) {
    console.error("Error creating auth user:", error);
    return false;
  }
};

export const updateUser = async (
  userId: string,
  updates: Partial<AuthUser>
) => {
  try {
    console.log("updates ---", updates);
    const supabase = await createClientAdmin();
    const {
      data: { user },
      error,
    } = await supabase.auth.admin.updateUserById(userId, { ...updates });

    if (error || !user) throw error;

    return user;
  } catch (error) {
    console.log("Error on update auth user", error);
    return false;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const supabase = await createClientAdmin();
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.log("Error on delete auth user", error);
    return false;
  }
};
