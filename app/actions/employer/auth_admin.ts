"use server";
import { getAllAlumniProfiles } from "@/app/actions/employer/profiles";
import { createClientAdmin } from "@/utils/supabase/server";

export const getAllAlumni = async () => {
  try {
    const supabase = await createClientAdmin();
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers();

    if (error) throw error;

    const alumniProfiles = await getAllAlumniProfiles();

    if (!users || !alumniProfiles) {
      throw new Error("users and alumni profiles is not available");
    }
    const allAlumni = alumniProfiles.map((alumni) => ({
      profile: alumni,
      ...users?.find((p) => p.id === alumni.id),
    }));

    return allAlumni;
  } catch (error) {
    console.error("Error fetching all auth users:", error);
    return false;
  }
};
