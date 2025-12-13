import { z } from "zod/mini";
import { JobT } from ".";
import { newJobApplicationFormSchema } from "../utils/job-application-schema";

export type JobApplicationStatusType = "applied" | "rejected" | "accepted" | string;

export interface IJobApplicationType {
    id: number;
    job_id: string;
    user_id: string;
    status: JobApplicationStatusType;
    created_at: string;
    updated_at?: string;
}

export type JobApplicationWithJobType = IJobApplicationType & { jobs?: JobT };

export type newJobApplicationFormSchemaType = z.infer<typeof newJobApplicationFormSchema>;
