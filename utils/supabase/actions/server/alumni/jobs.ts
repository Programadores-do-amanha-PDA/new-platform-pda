"use server";
import { createClient } from "@/utils/supabase/server";

export const getAllJobs = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .select()
      .eq("curated", true);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching all jobs search:", error);
    return null;
  }
};
