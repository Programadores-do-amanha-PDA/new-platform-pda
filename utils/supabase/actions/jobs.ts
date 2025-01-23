"use server";
import { JobType } from "@/types/jobs";
import { createClient } from "@/utils/supabase/server";

export const getAllJobs = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .select("id, title, company, description, details, link, created_at");

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching all jobs search:", error);
    return null;
  }
};

export const getJobByID = async (jobId: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching job:", error);
    return null;
  }
};

export const createJob = async (job: JobType) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .insert(job)
      .select();

      console.log(data, error)

    if (error) throw error;

    return data[0];
  } catch (error) {
    console.error("Error creating job:", error);
    return null;
  }
}

export const updateJob = async (
  jobId: string,
  updates: Partial<JobType>
) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .update(updates)
      .eq("id", jobId)
      .select();

    if (error) throw error;

    return data[0];
  } catch (error) {
    console.error("Error updating job:", error);
    return null;
  }
};

export const deleteJob = async (jobId: string) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("jobs").delete().eq("id", jobId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting job:", error);
    return false;
  }
};
