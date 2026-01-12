import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

import { createJob, deleteJob, getAllCuratedJobs, getAllJobsWithApplications, updateJob } from "../actions";
import {
    IJobState,
    IJobActions,
    SetJobsProps,
    CreateJobStoreProps,
    UpdateJobStoreProps,
    CurateJobProps,
    ResendJobToCurationProps,
    MarkJobAsOnDiscordProps,
    ArchiveJobProps,
    DeleteJobStoreProps,
} from "../types";

const initialState: IJobState = {
    jobs: [],
    loading: false,
};

export const useJobStore = create<IJobState & IJobActions>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setJobs: ({ jobs }: SetJobsProps) => {
                if (!jobs) {
                    console.error("Invalid jobs data");
                    return;
                }
                set({ jobs });
            },

            getAllJobs: async () => {
                set({ loading: true });

                try {
                    const jobsResponse = await getAllJobsWithApplications();
                    if (!jobsResponse) throw new Error("Failed to fetch jobs");

                    set({ jobs: jobsResponse });
                    return true;
                } catch (error) {
                    console.error("Error fetching jobs:", error);
                    toast.error("Erro ao buscar as vagas. Tente novamente mais tarde!");
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            getAllCuratedJobs: async () => {
                set({ loading: true });

                try {
                    const jobsResponse = await getAllCuratedJobs();
                    if (!jobsResponse) throw new Error("Failed to fetch curated jobs");

                    set({ jobs: jobsResponse });
                    return true;
                } catch (error) {
                    console.error("Error fetching curated jobs:", error);
                    toast.error("Erro ao buscar as vagas curadas. Tente novamente mais tarde!");
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            createJob: async ({ jobData }: CreateJobStoreProps) => {
                try {
                    if (!jobData) throw new Error("Invalid job data");

                    const jobCreated = await createJob({ jobData });
                    if (!jobCreated) throw new Error("Failed to create job");

                    set({ jobs: [...get().jobs, jobCreated] });
                    toast.success("Vaga criada com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error creating job:", error);
                    toast.error("Erro ao criar a vaga. Tente novamente mais tarde!");
                    return false;
                }
            },

            updateJob: async ({ jobId, updates }: UpdateJobStoreProps) => {
                try {
                    if (!jobId) throw new Error("Invalid job id");
                    if (!updates) throw new Error("Invalid update data");

                    const jobUpdated = await updateJob({ jobId, updates });
                    if (!jobUpdated) throw new Error("Failed to update job");

                    set({
                        jobs: get().jobs.map((job) => (job.id === jobId ? jobUpdated : job)),
                    });
                    toast.success("Vaga atualizada com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error updating job:", error);
                    toast.error("Erro ao editar vaga. Tente novamente mais tarde!");
                    return false;
                }
            },

            curateJob: async ({ jobId }: CurateJobProps) => {
                try {
                    if (!jobId) throw new Error("Invalid job id");

                    const jobUpdated = await updateJob({
                        jobId,
                        updates: {
                            curated: true,
                            is_archived: false,
                        },
                    });

                    if (!jobUpdated) throw new Error("Failed to curate job");

                    set({
                        jobs: get().jobs.map((job) => (job.id === jobId ? jobUpdated : job)),
                    });

                    toast.success("Vaga aprovada com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error curating job:", error);
                    toast.error("Erro ao aprovar vaga. Tente novamente mais tarde!");
                    return false;
                }
            },

            resendJobToCuration: async ({ jobId }: ResendJobToCurationProps) => {
                try {
                    if (!jobId) throw new Error("Invalid job id");

                    const jobUpdated = await updateJob({
                        jobId,
                        updates: {
                            curated: false,
                            is_archived: false,
                        },
                    });

                    if (!jobUpdated) throw new Error("Failed to resend job to curation");

                    set({
                        jobs: get().jobs.map((job) => (job.id === jobId ? jobUpdated : job)),
                    });

                    toast.success("Vaga reenviada à curadoria com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error resending job to curation:", error);
                    toast.error("Erro ao reenviar vaga à curadoria. Tente novamente mais tarde!");
                    return false;
                }
            },

            markJobAsOnDiscord: async ({ jobId }: MarkJobAsOnDiscordProps) => {
                try {
                    if (!jobId) throw new Error("Invalid job id");

                    const jobUpdated = await updateJob({
                        jobId,
                        updates: {
                            is_on_discord: true,
                        },
                    });

                    if (!jobUpdated) throw new Error("Failed to mark job as on Discord");

                    set({
                        jobs: get().jobs.map((job) => (job.id === jobId ? jobUpdated : job)),
                    });

                    toast.success("Vaga marcada como enviada ao Discord com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error marking job as on Discord:", error);
                    toast.error("Erro ao marcar vaga como enviada ao Discord. Tente novamente mais tarde!");
                    return false;
                }
            },

            archiveJob: async ({ jobId }: ArchiveJobProps) => {
                try {
                    if (!jobId) throw new Error("Invalid job id");

                    const jobUpdated = await updateJob({
                        jobId,
                        updates: {
                            curated: false,
                            is_archived: true,
                        },
                    });

                    if (!jobUpdated) throw new Error("Failed to archive job");

                    set({
                        jobs: get().jobs.map((job) => (job.id === jobId ? jobUpdated : job)),
                    });

                    toast.success("Vaga arquivada com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error archiving job:", error);
                    toast.error("Erro ao arquivar a vaga. Tente novamente mais tarde!");
                    return false;
                }
            },

            deleteJob: async ({ jobId }: DeleteJobStoreProps) => {
                try {
                    if (!jobId) throw new Error("Invalid job id");

                    const response = await deleteJob({ jobId });
                    if (!response) throw new Error("Failed to delete job");

                    set({ jobs: get().jobs.filter((job) => job.id !== jobId) });
                    toast.success("Vaga deletada com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error deleting job:", error);
                    toast.error("Erro ao deletar vaga. Tente novamente mais tarde!");
                    return false;
                }
            },

            reset: () => {
                set(initialState);
            },
        }),
        { name: "JobStore" },
    ),
);
