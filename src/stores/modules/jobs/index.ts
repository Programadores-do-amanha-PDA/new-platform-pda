import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

import { JobT, JobWithApplicationsT } from "@/types/jobs";
import {
  createJob,
  deleteJob,
  getAllCuratedJobs,
  getAllJobsWithApplications,
  updateJob,
} from "@/app/actions/jobs";

interface JobState {
  jobs: JobWithApplicationsT[];
  loading: boolean;
}

interface JobActions {
  setJobs: (jobs: JobWithApplicationsT[]) => void;
  getAllJobs: () => Promise<boolean>;
  getAllCuratedJobs: () => Promise<boolean>;
  createJob: (job: Partial<JobT>) => Promise<boolean>;
  updateJob: (jobId: string, updates: Partial<JobT>) => Promise<boolean>;
  curateJob: (jobId: string) => Promise<boolean>;
  resendJobToCuration: (jobId: string) => Promise<boolean>;
  markJobAsOnDiscord: (jobId: string) => Promise<boolean>;
  archiveJob: (jobId: string | null) => Promise<boolean>;
  deleteJob: (jobId: string | null) => Promise<boolean>;
  reset: () => void;
}

const initialState: JobState = {
  jobs: [],
  loading: false,
};

export const useJobStore = create<JobState & JobActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setJobs: (jobs) => set({ jobs }),

      getAllJobs: async () => {
        try {
          set({ loading: true });
          const jobsResponse = await getAllJobsWithApplications();
          if (!jobsResponse) throw "no jobs response";
          set({ jobs: jobsResponse });
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao buscar as vagas. Tente novamente mais tarde!");
          return false;
        } finally {
          set({ loading: false });
        }
      },

      getAllCuratedJobs: async () => {
        try {
          set({ loading: true });
          const jobsResponse = await getAllCuratedJobs();
          if (!jobsResponse) throw "no jobs response";
          set({ jobs: jobsResponse });
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao buscar as vagas. Tente novamente mais tarde!");
          return false;
        } finally {
          set({ loading: false });
        }
      },

      createJob: async (newJob) => {
        try {
          const jobCreated = await createJob(newJob);

          if (!jobCreated) throw "job is not created successfully";

          set({ jobs: [...get().jobs, jobCreated] });
          toast.success("Sucesso ao criar a vaga!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao criar a vaga. Tente novamente mais tarde!");
          return false;
        }
      },

      updateJob: async (jobId, updates) => {
        try {
          const jobUpdated = await updateJob(jobId, updates);

          if (!jobUpdated) throw new Error("job is not updated successfully");

          set({
            jobs: get().jobs.map((job) =>
              job.id === jobId ? jobUpdated : job
            ),
          });
          toast.success("Sucesso ao editar vaga!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao editar vaga. Tente novamente mais tarde!");
          return false;
        }
      },

      curateJob: async (jobId) => {
        try {
          const jobUpdated = await updateJob(jobId, {
            curated: true,
            is_archived: false,
          });

          if (!jobUpdated) throw new Error("job is not updated successfully");

          set({
            jobs: get().jobs.map((job) =>
              job.id === jobId ? jobUpdated : job
            ),
          });

          toast.success("Vaga aprovada com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao aprovar vaga. Tente novamente mais tarde!");
          return false;
        }
      },

      resendJobToCuration: async (jobId) => {
        try {
          const jobUpdated = await updateJob(jobId, {
            curated: false,
            is_archived: false,
          });

          if (!jobUpdated) throw new Error("job is not updated successfully");

          set({
            jobs: get().jobs.map((job) =>
              job.id === jobId ? jobUpdated : job
            ),
          });

          toast.success("Vaga reenviada a curadoria com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error(
            "Erro ao reenviada vaga a curadoria. Tente novamente mais tarde!"
          );
          return false;
        }
      },

      markJobAsOnDiscord: async (jobId) => {
        try {
          const jobUpdated = await updateJob(jobId, {
            is_on_discord: true,
          });

          if (!jobUpdated) throw new Error("job is not updated successfully");

          set({
            jobs: get().jobs.map((job) =>
              job.id === jobId ? { ...job, is_on_discord: true } : job
            ),
          });

          toast.success("Vaga marcada como enviada ao Discord com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error(
            "Erro ao marcar vaga como enviada ao Discord. Tente novamente mais tarde!"
          );
          return false;
        }
      },

      archiveJob: async (jobId) => {
        try {
          if (!jobId) throw new Error("Invalid job ID");

          const response = await updateJob(jobId, {
            curated: false,
            is_archived: true,
          });
          if (!response) throw new Error("failed to update job");

          set({
            jobs: get().jobs.map((job) =>
              job.id === jobId
                ? { ...job, curated: false, is_archived: true }
                : job
            ),
          });

          toast.success("Vaga arquivada com sucesso!");
          return true;
        } catch (error) {
          console.error("Error to curate job:", error);
          toast.error("Erro ao arquivar a vaga.");
          return false;
        }
      },

      deleteJob: async (jobId) => {
        try {
          if (!jobId) throw new Error("Invalid job ID");

          const response = await deleteJob(jobId);

          if (!response) throw new Error("no delete job response");

          set({ jobs: get().jobs.filter((job) => job.id !== jobId) });
          toast.success("Vaga deletada com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao deletar vaga. tente novamente mais tarde!");
          return false;
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "JobStore" }
  )
);
