"use server";
import { createClient } from "@/lib/supabase/server";

export const getAllJobsSearch = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs_search")
      .select(
        "id, configs, created_at, jobs(id, title, description, details, link)"
      );

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching all jobs search:", error);
    return null;
  }
};

export const getJobSearchByID = async (jobSearchId: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs_search")
      .select("*")
      .eq("id", jobSearchId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching job search:", error);
    return null;
  }
};

export const updateJobSearch = async (
  jobSearchId: string,
  updates: Partial<{
    configs: {
      title: string;
      filters: {
        experience: number[];
        time_posted: number;
        workplace_types: number[];
      };
      location: string;
      amount_jobs: string;
      technologies: string[];
    };
  }>
) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs_search")
      .update(updates)
      .eq("id", jobSearchId)
      .select();

    if (error) throw error;

    return data[0];
  } catch (error) {
    console.error("Error updating job search:", error);
    return null;
  }
};

export const deleteJobSearch = async (jobSearchId: string) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("jobs_search")
      .delete()
      .eq("id", jobSearchId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting job search:", error);
    return false;
  }
};
