"use server";

import { getSupabaseClient } from "@/lib/supabase/client-manager";

import { newJobApplicationFormSchema, updateJobApplicationFormSchema } from "../utils/job-application-schema";
import { logger } from "@/lib/logger";
import {
    GetAllJobApplicationsResult,
    GetJobApplicationsByUserIdParams,
    GetJobApplicationsByUserIdResult,
    JobApplication,
    GetAllJobApplicationsByJobIdParams,
    GetAllJobApplicationsByJobIdResult,
    GetJobApplicationByIdParams,
    GetJobApplicationByIdResult,
    CreateJobApplicationParams,
    CreateJobApplicationResult,
    UpdateJobApplicationByIdParams,
    UpdateJobApplicationByIdResult,
    DeleteJobApplicationByIdParams,
    DeleteJobApplicationByIdResult,
} from "../types/job-applications/job-application";

const log = logger.child({ module: "job-applications.actions" });

export const getAllJobApplications = async (): Promise<GetAllJobApplicationsResult> => {
    try {
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase.from("job_applications").select("*");
        if (error) throw error;

        return data;
    } catch (error) {
        log.error({ err: error, operation: "getAllJobApplications" }, "Failed to fetch all job applications");
        return null;
    }
};

export const getAllJobApplicationsByUserId = async ({
    userId,
}: GetJobApplicationsByUserIdParams): Promise<GetJobApplicationsByUserIdResult> => {
    try {
        if (!userId) throw new Error("Invalid user id");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("job_applications").select("*").eq("user_id", userId);
        if (error) throw error;

        return data as JobApplication[];
    } catch (error) {
        log.error(
            { err: error, userId, operation: "getAllJobApplicationsByUserId" },
            "Failed to fetch job applications for user",
        );
        return null;
    }
};

export const getAllJobApplicationsByJobId = async ({
    jobId,
}: GetAllJobApplicationsByJobIdParams): Promise<GetAllJobApplicationsByJobIdResult> => {
    try {
        if (!jobId) throw new Error("Invalid job id");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("job_applications").select("*, jobs!inner(*)").eq("job_id", jobId);
        if (error) throw error;

        return data;
    } catch (error) {
        log.error({ err: error, jobId, operation: "getAllJobApplicationsByJobId" }, "Failed to fetch job applications for job");
        return null;
    }
};

export const getJobApplicationById = async ({ id }: GetJobApplicationByIdParams): Promise<GetJobApplicationByIdResult> => {
    try {
        if (!id) throw new Error("Invalid job application id");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("job_applications").select("*, jobs!inner(*)").eq("id", id).single();
        if (error) throw error;

        return data;
    } catch (error) {
        log.error(
            { err: error, applicationId: id, operation: "getJobApplicationById" },
            "Failed to fetch job application by ID",
        );
        return null;
    }
};

export const createJobApplication = async ({
    applicationData,
}: CreateJobApplicationParams): Promise<CreateJobApplicationResult> => {
    try {
        if (!newJobApplicationFormSchema.parse(applicationData)) throw new Error("Invalid application data");

        const supabase = await getSupabaseClient();
        const { data, error } = await supabase.from("job_applications").insert(applicationData).select().single();

        if (error) throw error;

        log.info(
            { applicationId: data.id, userId: applicationData.user_id, jobId: applicationData.job_id },
            "Job application created successfully",
        );
        return data;
    } catch (error) {
        log.error(
            {
                err: error,
                userId: applicationData?.user_id,
                jobId: applicationData?.job_id,
                operation: "createJobApplication",
            },
            "Failed to create job application",
        );

        return null;
    }
};

export const updateJobApplicationById = async ({
    id,
    applicationData,
}: UpdateJobApplicationByIdParams): Promise<UpdateJobApplicationByIdResult> => {
    try {
        if (!id) throw new Error("Invalid job application id");
        if (!updateJobApplicationFormSchema.parse(applicationData)) throw new Error("Invalid application data");

        const supabase = await getSupabaseClient();
        const { data, error } = await supabase.from("job_applications").update(applicationData).eq("id", id).select().single();

        if (error) throw error;

        log.info({ applicationId: id }, "Job application updated successfully");
        return data;
    } catch (error) {
        log.error({ err: error, applicationId: id, operation: "updateJobApplicationById" }, "Failed to update job application");
        return null;
    }
};

export const deleteJobApplicationById = async ({
    id,
}: DeleteJobApplicationByIdParams): Promise<DeleteJobApplicationByIdResult> => {
    try {
        if (!id) throw new Error("Invalid job application id");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { error } = await supabase.from("job_applications").delete().eq("id", id);

        if (error) throw error;

        log.info({ applicationId: id }, "Job application deleted successfully");
        return true;
    } catch (error) {
        log.error({ err: error, applicationId: id, operation: "deleteJobApplicationById" }, "Failed to delete job application");
        return false;
    }
};
