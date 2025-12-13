import { z } from "zod/mini";
import { JobT } from "..";
import { newJobApplicationFormSchema } from "../../utils/job-application-schema";

export type JobApplicationStatusType = "applied" | "rejected" | "accepted" | string;

export interface IJobApplication {
    id: string;
    job_id: string;
    user_id: string;
    status: JobApplicationStatusType;
    created_at: string;
    updated_at?: string;
}

export type JobApplicationWithJobType = IJobApplication & { jobs?: JobT };

export type newJobApplicationFormSchemaType = z.infer<typeof newJobApplicationFormSchema>;

export type CreateJobApplicationProps = {
    applicationData: Omit<IJobApplication, "id" | "created_at" | "updated_at">;
};
export type CreateJobApplicationResult = IJobApplication | null;

export type GetAllJobApplicationsResult = IJobApplication[] | null;

export type GetJobApplicationsByUserIdProps = {
    userId: string;
};
export type GetJobApplicationsByUserIdResult = IJobApplication[] | null;

export type GetAllJobApplicationsByJobIdProps = {
    jobId: string;
};
export type GetAllJobApplicationsByJobIdResult = IJobApplication[] | null;

export type GetJobApplicationByIdProps = {
    id: string;
};
export type GetJobApplicationByIdResult = IJobApplication | null;

export type UpdateJobApplicationByIdProps = {
    id: string;
    applicationData: IJobApplication;
};
export type UpdateJobApplicationByIdResult = IJobApplication | null;

export type DeleteJobApplicationByIdProps = {
    id: string;
};
export type DeleteJobApplicationByIdResult = boolean;
