import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

import {
  JobApplicationStatusT,
  JobApplicationT,
  JobApplicationWithJobT,
} from "@/types/jobs";
import {
  createJobApplication,
  deleteJobApplicationById,
  getAllJobApplications,
  getAllJobApplicationsByUserId,
  updateJobApplicationById,
} from "@/app/actions/jobs";
import { AuthUserWithProfileT } from "@/types/auth";

interface JobApplicationState {
  applications: JobApplicationWithJobT[];
  loading: boolean;
}

interface JobApplicationActions {
  setApplications: (applications: JobApplicationWithJobT[]) => void;
  getAllApplications: () => Promise<boolean>;
  getAllApplicationsByUserId: (user: AuthUserWithProfileT) => Promise<boolean>;
  createApplication: (
    applicationData: Partial<JobApplicationT>,
    user: AuthUserWithProfileT
  ) => Promise<boolean>;
  updateApplicationStatus: (
    applicationId: number,
    status: JobApplicationStatusT
  ) => Promise<boolean>;
  deleteApplication: (applicationId: number) => Promise<boolean>;
  reset: () => void;
}

const initialState: JobApplicationState = {
  applications: [],
  loading: false,
};

export const useJobApplicationStore = create<
  JobApplicationState & JobApplicationActions
>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setApplications: (applications) => set({ applications }),

      getAllApplications: async () => {
        set({ loading: true });

        try {
          const jobApplicationsResponse = await getAllJobApplications();
          if (!jobApplicationsResponse)
            throw "get all job applications response is null";
          set({ applications: jobApplicationsResponse });

          return true;
        } catch (error) {
          console.error(error);
          toast.error(
            "Erro ao buscar as candidaturas. Tente novamente mais tarde!"
          );
          return false;
        } finally {
          set({ loading: false });
        }
      },

      getAllApplicationsByUserId: async (user) => {
        set({ loading: true });

        try {
          if (!user.id) throw "user id is null";

          const jobApplicationsResponse = await getAllJobApplicationsByUserId(
            user.id
          );
          if (!jobApplicationsResponse)
            throw "get all job applications response is null";
          set({ applications: jobApplicationsResponse });

          return true;
        } catch (error) {
          console.error("error fetching job applications:", error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      createApplication: async (applicationData, user) => {
        try {
          if (!user.id || !applicationData.job_id || !applicationData.status)
            throw "user id and job id is required";

          const application = await createJobApplication({
            ...applicationData,
            user_id: user.id,
          });
          if (!application) throw "create job application response is null";

          set({ applications: [...get().applications, application] });
          return true;
        } catch (error) {
          console.error(error);
          toast.error(
            "Erro ao declarar a candidatura! Tente recarregar a pagina!"
          );
          return false;
        }
      },

      updateApplicationStatus: async (applicationId, status) => {
        try {
          if (!applicationId) throw "application id is required";

          const application: JobApplicationT | undefined =
            get().applications.find(
              (application) => application.id === applicationId
            );
          if (!application || !status) throw "job application not found";

          const updatedApplication: JobApplicationT | undefined =
            await updateJobApplicationById(applicationId, {
              status,
              updated_at: JSON.stringify(new Date()),
            });
          if (!updatedApplication)
            throw "update job application response is null";

          set({
            applications: [
              ...get().applications.filter(
                (application) => application.id !== applicationId
              ),
              updatedApplication,
            ],
          });

          toast.success("Status da candidatura foi atualizado com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao atualizar o status da candidatura!");
          return false;
        }
      },

      deleteApplication: async (applicationId) => {
        try {
          if (!applicationId) throw "application id is required";

          const application: JobApplicationT | undefined =
            get().applications.find(
              (application) => application.id === applicationId
            );
          if (!application) throw "job application not found";

          const deletedApplication = await deleteJobApplicationById(
            applicationId
          );
          if (!deletedApplication)
            throw "delete job application response is null";

          set({
            applications: get().applications.filter(
              (application) => application.id !== applicationId
            ),
          });

          toast.success("Candidatura deletada com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao deletar a candidatura!");
          return false;
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "JobApplicationStore" }
  )
);
