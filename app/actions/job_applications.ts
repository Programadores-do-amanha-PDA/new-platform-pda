"use server";
import { JobApplication } from "@/types/jobs";
import { createClient } from "@/utils/supabase/server";

export const createJobApplication = async (
  applicationData: Partial<JobApplication>
) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("job_applications")
      .insert([applicationData])
      .select();

    if (error) throw error;

    return data[0];
  } catch (error) {
    console.error("Error creating job application:", error);
    return null;
  }
};

export const getAllJobApplications = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("job_applications")
      .select("*, jobs!inner(*)");
    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching all job applications:", error);
    return null;
  }
};

export const getAllJobApplicationsByUserId = async (userId: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("job_applications")
      .select("*, jobs!inner(*)")
      .eq("user_id", userId);
    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching all job applications by user id:", error);
    return null;
  }
};

export const getAllJobApplicationsByJobId = async (jobId: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("job_applications")
      .select("*, jobs!inner(*)")
      .eq("job_id", jobId);
    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching all job applications by job id:", error);
    return null;
  }
};

export const getJobApplicationById = async (id: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("job_applications")
      .select("*, jobs!inner(*)")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

export const updateJobApplicationById = async (
  id: number,
  applicationData: Partial<JobApplication>
) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("job_applications")
      .update(applicationData)
      .eq("id", id)
      .select("*, jobs!inner(*)");

    if (error) throw error;

    return data[0];
  } catch (error) {
    console.error("Error updating job application:", error);
    return null;
  }
};

export const deleteJobApplicationById = async (id: number) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting job application:", error);
    return false;
  }
};
