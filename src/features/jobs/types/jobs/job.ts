import { JobApplication } from "../job-applications/job-application";

export interface Job {
    id: string;
    title: string;
    company: string;
    description?: string;
    link: string;
    details?: JobDetailsT;
    created_at?: string;
    updated_at?: string;
    curated?: boolean;
    is_archived?: boolean;
    is_on_discord?: boolean;
}

export interface JobDetailsT {
    locale: string[];
    workplace_type: string[];
    languages: string[];
}

export type JobWithApplicationsT = Job & { applications?: JobApplication[] };
