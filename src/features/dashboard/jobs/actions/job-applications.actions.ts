"use server";

import { getSupabaseClient } from "@/lib/supabase/client-manager";
import { IJobApplicationType } from "../types";
import { newJobApplicationFormSchema, updateJobApplicationFormSchema } from "../utils/job-application-schema";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "job-applications.actions" });

export type CreateJobApplicationProps = {
    applicationData: Omit<IJobApplicationType, "id" | "created_at" | "updated_at">;
};
export type CreateJobApplicationResult = IJobApplicationType | null;

export type GetAllJobApplicationsResult = IJobApplicationType[] | null;

export type GetJobApplicationsByUserIdProps = {
    userId: string;
};
export type GetJobApplicationsByUserIdResult = IJobApplicationType[] | null;

export type GetAllJobApplicationsByJobIdProps = {
    jobId: string;
};
export type GetAllJobApplicationsByJobIdResult = IJobApplicationType[] | null;

export type GetJobApplicationByIdProps = {
    id: string;
};
export type GetJobApplicationByIdResult = IJobApplicationType | null;

export type UpdateJobApplicationByIdProps = {
    id: string;
    applicationData: IJobApplicationType;
};
export type UpdateJobApplicationByIdResult = IJobApplicationType | null;

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
}: GetJobApplicationsByUserIdProps): Promise<GetJobApplicationsByUserIdResult> => {
    try {
        if (!userId) throw new Error("Invalid user id");

        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Invalid supabase client");

        const { data, error } = await supabase.from("job_applications").select("*").eq("user_id", userId);
        if (error) throw error;

        return data as IJobApplicationType[];
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
}: GetAllJobApplicationsByJobIdProps): Promise<GetAllJobApplicationsByJobIdResult> => {
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

export const getJobApplicationById = async ({ id }: GetJobApplicationByIdProps): Promise<GetJobApplicationByIdResult> => {
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
}: CreateJobApplicationProps): Promise<CreateJobApplicationResult> => {
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
}: UpdateJobApplicationByIdProps): Promise<UpdateJobApplicationByIdResult> => {
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

export const deleteJobApplicationById = async (id: number) => {
    try {
        const supabase = await getSupabaseClient();
        const { error } = await supabase.from("job_applications").delete().eq("id", id);

        if (error) throw error;

        log.info({ applicationId: id }, "Job application deleted successfully");
        return true;
    } catch (error) {
        log.error({ err: error, applicationId: id, operation: "deleteJobApplicationById" }, "Failed to delete job application");
        return false;
    }
};
