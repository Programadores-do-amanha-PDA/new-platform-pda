import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "@/lib/toast";

import {
    getAllJobApplications,
    getAllJobApplicationsByUserId,
    createJobApplication,
    updateJobApplicationById,
    deleteJobApplicationById,
} from "../actions/job-applications";
import {
    JobApplicationState,
    IJobApplicationActions,
    SetApplicationsProps,
    GetAllApplicationsByUserIdProps,
    CreateApplicationProps,
    UpdateApplicationStatusProps,
    DeleteApplicationProps,
} from "../types/job-applications/job-application-store";

const initialState: JobApplicationState = {
    applications: [],
    loading: false,
};

export const useJobApplicationStore = create<JobApplicationState & IJobApplicationActions>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setApplications: ({ applications }: SetApplicationsProps) => {
                if (!applications) {
                    console.error("Invalid applications data");
                    return;
                }
                set({ applications });
            },

            getAllApplications: async () => {
                set({ loading: true });

                try {
                    const jobApplicationsResponse = await getAllJobApplications();
                    if (!jobApplicationsResponse) throw "get all job applications response is null";
                    set({ applications: jobApplicationsResponse });

                    return true;
                } catch (error) {
                    console.error(error);
                    toast.error({
                        title: "Erro ao buscar as candidaturas",
                        description: "Ocorreu um erro ao buscar as candidaturas. Tente novamente mais tarde!",
                    });
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            getAllApplicationsByUserId: async ({ user }: GetAllApplicationsByUserIdProps) => {
                set({ loading: true });

                try {
                    if (!user?.id) throw new Error("Invalid user or user id");

                    const jobApplicationsResponse = await getAllJobApplicationsByUserId({ userId: user.id });
                    if (!jobApplicationsResponse) throw new Error("Failed to fetch job applications");

                    set({ applications: jobApplicationsResponse });
                    return true;
                } catch (error) {
                    console.error("Error fetching job applications:", error);
                    toast.error({
                        title: "Erro ao buscar as candidaturas",
                        description: "Ocorreu um erro ao buscar as candidaturas. Tente novamente mais tarde!",
                    });
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            createApplication: async ({ applicationData, user }: CreateApplicationProps) => {
                try {
                    if (!user?.id) throw new Error("Invalid user or user id");
                    if (!applicationData?.job_id) throw new Error("Invalid job id");
                    if (!applicationData?.status) throw new Error("Invalid application status");

                    const data = { ...applicationData, user_id: user.id };

                    const application = await createJobApplication({ applicationData: data });
                    if (!application) throw new Error("Failed to create job application");

                    set({ applications: [...get().applications, application] });
                    toast.success({
                        title: "Candidatura criada com sucesso",
                        description: "A candidatura foi criada com sucesso!",
                    });
                    return true;
                } catch (error) {
                    console.error("Error creating application:", error);
                    toast.error({
                        title: "Erro ao declarar a candidatura",
                        description: "Ocorreu um erro ao declarar a candidatura! Tente recarregar a página!",
                    });
                    return false;
                }
            },

            updateApplicationStatus: async ({ applicationId, status }: UpdateApplicationStatusProps) => {
                try {
                    if (!applicationId) throw new Error("Invalid application id");
                    if (!status) throw new Error("Invalid status");

                    const application = get().applications.find((app) => app.id === applicationId);
                    if (!application) throw new Error("Job application not found");

                    const updatedApplication = await updateJobApplicationById({
                        id: applicationId,
                        applicationData: {
                            ...application,
                            status,
                            updated_at: new Date().toISOString(),
                        },
                    });

                    if (!updatedApplication) throw new Error("Failed to update job application");

                    set({
                        applications: get().applications.map((app) => (app.id === applicationId ? updatedApplication : app)),
                    });

                    toast.success({
                        title: "Status da candidatura atualizado com sucesso",
                        description: "O status da candidatura foi atualizado com sucesso!",
                    });
                    return true;
                } catch (error) {
                    console.error("Error updating application status:", error);
                    toast.error({
                        title: "Erro ao atualizar o status da candidatura",
                        description: "Ocorreu um erro ao atualizar o status da candidatura!",
                    });
                    return false;
                }
            },

            deleteApplication: async ({ applicationId }: DeleteApplicationProps) => {
                try {
                    if (!applicationId) throw new Error("Invalid application id");

                    const application = get().applications.find((app) => app.id === applicationId);
                    if (!application) throw new Error("Job application not found");

                    const deletedApplication = await deleteJobApplicationById({ id: applicationId });
                    if (!deletedApplication) throw new Error("Failed to delete job application");

                    set({
                        applications: get().applications.filter((app) => app.id !== applicationId),
                    });

                    toast.success({
                        title: "Candidatura deletada com sucesso",
                        description: "A candidatura foi deletada com sucesso!",
                    });
                    return true;
                } catch (error) {
                    console.error("Error deleting application:", error);
                    toast.error({
                        title: "Erro ao deletar a candidatura",
                        description: "Ocorreu um erro ao deletar a candidatura!",
                    });
                    return false;
                }
            },

            reset: () => {
                set(initialState);
            },
        }),
        { name: "JobApplicationStore" },
    ),
);
