import { z } from "zod/mini";

import { newJobApplicationFormSchema } from "../../utils/job-application-schema";
import { Job } from "../jobs/job";

export type JobApplicationStatus = "applied" | "rejected" | "accepted" | string;

export interface JobApplication {
    id: string;
    job_id: string;
    user_id: string;
    status: JobApplicationStatus;
    created_at: string;
    updated_at?: string;
}

export interface JobApplicationWithJob extends JobApplication {
    job?: Job;
}

export type NewJobApplicationFormSchema = z.infer<typeof newJobApplicationFormSchema>;

export type CreateJobApplicationParams = {
    applicationData: Omit<JobApplication, "id" | "created_at" | "updated_at">;
};
export type CreateJobApplicationResult = JobApplication | null;

export type GetAllJobApplicationsResult = JobApplication[] | null;

export interface GetJobApplicationsByUserIdParams {
    userId: string;
};
export type GetJobApplicationsByUserIdResult = JobApplication[] | null;

export interface GetAllJobApplicationsByJobIdParams {
    jobId: string;
};
export type GetAllJobApplicationsByJobIdResult = JobApplication[] | null;

export interface GetJobApplicationByIdParams {
    id: string;
};
export type GetJobApplicationByIdResult = JobApplication | null;

export interface UpdateJobApplicationByIdParams {
    id: string;
    applicationData: JobApplication;
};
export type UpdateJobApplicationByIdResult = JobApplication | null;

export interface DeleteJobApplicationByIdParams {
    id: string;
};
export type DeleteJobApplicationByIdResult = boolean;
