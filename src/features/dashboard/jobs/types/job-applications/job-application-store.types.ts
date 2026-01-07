import { AuthUserWithProfile } from "@/features/dashboard/profile";
import { IJobApplication, JobApplicationStatusType, JobApplicationWithJobType } from "..";

export interface JobApplicationState {
    applications: JobApplicationWithJobType[];
    loading: boolean;
}

export type SetApplicationsProps = {
    applications: JobApplicationWithJobType[];
};

export type GetAllApplicationsByUserIdProps = {
    user: AuthUserWithProfile;
};

export type CreateApplicationProps = {
    applicationData: Omit<IJobApplication, "id" | "created_at" | "updated_at">;
    user: AuthUserWithProfile;
};

export type UpdateApplicationStatusProps = {
    applicationId: string;
    status: JobApplicationStatusType;
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