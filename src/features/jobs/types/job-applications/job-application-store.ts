import { Profile } from "@/features/users/profile/types/profile";
import { JobApplicationWithJob, JobApplication, JobApplicationStatus } from "./job-application";

export interface JobApplicationState {
    applications: JobApplicationWithJob[];
    loading: boolean;
}

export type SetApplicationsProps = {
    applications: JobApplicationWithJob[];
};

export type GetAllApplicationsByUserIdProps = {
    user: Profile;
};

export type CreateApplicationProps = {
    applicationData: Omit<JobApplication, "id" | "created_at" | "updated_at">;
    user: Profile;
};

export type UpdateApplicationStatusProps = {
    applicationId: string;
    status: JobApplicationStatus;
};

export type DeleteApplicationProps = {
    applicationId: string;
};

export interface IJobApplicationActions {
    setApplications: (props: SetApplicationsProps) => void;
    getAllApplications: () => Promise<boolean>;
    getAllApplicationsByUserId: (props: GetAllApplicationsByUserIdProps) => Promise<boolean>;
    createApplication: (props: CreateApplicationProps) => Promise<boolean>;
    updateApplicationStatus: (props: UpdateApplicationStatusProps) => Promise<boolean>;
    deleteApplication: (props: DeleteApplicationProps) => Promise<boolean>;
    reset: () => void;
}