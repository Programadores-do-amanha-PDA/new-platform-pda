"use server";

import { getSupabaseClient } from "@/lib/supabase/client-manager";
import { logger } from "@/lib/logger";
import { Job, JobWithApplicationsT } from "../types/jobs/job";

const log = logger.child({ module: "jobs.actions" });

export type GetAllJobsResult = Job[] | null;

export type GetAllJobsWithApplicationsResult = JobWithApplicationsT[] | null;

export type GetAllCuratedJobsResult = Job[] | null;

export type GetJobByIdProps = {
    jobId: string;
};
export type GetJobByIdResult = Job | null;

export type CreateJobProps = {
    jobData: Partial<Job>;
};
export type CreateJobResult = Job | null;

export type UpdateJobProps = {
    jobId: string;
    updates: Partial<Job>;
};
export type UpdateJobResult = Job | null;

export type DeleteJobProps = {
    jobId: string;
};
export type DeleteJobResult = boolean;

export const getAllJobs = async (): Promise<GetAllJobsResult> => {
    try {
        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("jobs").select();

        if (error) throw error;

        return data as Job[];
    } catch (error) {
        log.error({ err: error, operation: "getAllJobs" }, "Failed to fetch all jobs");
        return null;
    }
};

export const getAllJobsWithApplications = async (): Promise<GetAllJobsWithApplicationsResult> => {
    try {
        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("jobs").select("*, applications:job_applications(*)");

        if (error) throw error;

        return data as JobWithApplicationsT[];
    } catch (error) {
        log.error({ err: error, operation: "getAllJobsWithApplications" }, "Failed to fetch all jobs with applications");
        return null;
    }
};

export const getAllCuratedJobs = async (): Promise<GetAllCuratedJobsResult> => {
    try {
        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("jobs").select().eq("curated", true);

        if (error) throw error;

        return data as Job[];
    } catch (error) {
        log.error({ err: error, operation: "getAllCuratedJobs" }, "Failed to fetch all curated jobs");
        return null;
    }
};

export const getJobByID = async ({ jobId }: GetJobByIdProps): Promise<GetJobByIdResult> => {
    try {
        if (!jobId) throw new Error("Invalid job id");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId).single();

        if (error) throw error;

        return data as Job;
    } catch (error) {
        log.error({ err: error, jobId, operation: "getJobByID" }, "Failed to fetch job by ID");
        return null;
    }
};

export const createJob = async ({ jobData }: CreateJobProps): Promise<CreateJobResult> => {
    try {
        if (!jobData) throw new Error("Invalid job data");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const key = process.env.NEXT_PUBLIC_PDA_JOBS_SEARCH_ID;

        const { data, error } = await supabase
            .from("jobs")
            .insert({ ...jobData, jobs_search_id: key })
            .select();

        if (error) throw error;

        log.info({ jobId: data[0]?.id }, "Job created successfully");
        return data[0];
    } catch (error) {
        log.error({ err: error, operation: "createJob" }, "Failed to create job");
        return null;
    }
};

export const updateJob = async ({ jobId, updates }: UpdateJobProps): Promise<UpdateJobResult> => {
    try {
        if (!jobId) throw new Error("Invalid job id");
        if (!updates) throw new Error("Invalid update data");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("jobs").update(updates).eq("id", jobId).select();

        if (error) throw error;

        log.info({ jobId }, "Job updated successfully");
        return data[0];
    } catch (error) {
        log.error({ err: error, jobId, operation: "updateJob" }, "Failed to update job");
        return null;
    }
};

export const deleteJob = async ({ jobId }: DeleteJobProps): Promise<DeleteJobResult> => {
    try {
        if (!jobId) throw new Error("Invalid job id");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { error } = await supabase.from("jobs").delete().eq("id", jobId);

        if (error) throw error;

        log.info({ jobId }, "Job deleted successfully");
        return true;
    } catch (error) {
        log.error({ err: error, jobId, operation: "deleteJob" }, "Failed to delete job");
        return false;
    }
};