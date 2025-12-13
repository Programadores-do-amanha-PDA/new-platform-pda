import { JobWithApplicationsT, JobT } from "..";

export interface IJobState {
    jobs: JobWithApplicationsT[];
    loading: boolean;
}

export type SetJobsProps = {
    jobs: JobWithApplicationsT[];
};

export type CreateJobStoreProps = {
    jobData: Partial<JobT>;
};

export type UpdateJobStoreProps = {
    jobId: string;
    updates: Partial<JobT>;
};

export type CurateJobProps = {
    jobId: string;
};

export type ResendJobToCurationProps = {
    jobId: string;
};

export type MarkJobAsOnDiscordProps = {
    jobId: string;
};

export type ArchiveJobProps = {
    jobId: string;
};

export type DeleteJobStoreProps = {
    jobId: string;
};

export interface IJobActions {
    setJobs: (props: SetJobsProps) => void;
    getAllJobs: () => Promise<boolean>;
    getAllCuratedJobs: () => Promise<boolean>;
    createJob: (props: CreateJobStoreProps) => Promise<boolean>;
    updateJob: (props: UpdateJobStoreProps) => Promise<boolean>;
    curateJob: (props: CurateJobProps) => Promise<boolean>;
    resendJobToCuration: (props: ResendJobToCurationProps) => Promise<boolean>;
    markJobAsOnDiscord: (props: MarkJobAsOnDiscordProps) => Promise<boolean>;
    archiveJob: (props: ArchiveJobProps) => Promise<boolean>;
    deleteJob: (props: DeleteJobStoreProps) => Promise<boolean>;
    reset: () => void;
}
