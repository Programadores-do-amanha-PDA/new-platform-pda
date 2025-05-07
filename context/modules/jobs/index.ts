import { useState } from "react";
import { toast } from "sonner";

import {
  createJob,
  deleteJob,
  getAllCuratedJobs,
  getAllJobsWithApplications,
  updateJob,
} from "@/app/actions/jobs";

import { JobT, JobWithApplicationsT } from "@/types/jobs";

const JobsStack = () => {
  const [jobs, setJobs] = useState<JobWithApplicationsT[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetAllJobs = async () => {
    try {
      setLoading(true);
      const jobsResponse = await getAllJobsWithApplications();
      if (!jobsResponse) throw "no jobs response";
      setJobs(jobsResponse);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar as vagas. Tente novamente mais tarde!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleGetAllCuratedJobs = async () => {
    try {
      setLoading(true);
      const jobsResponse = await getAllCuratedJobs();
      if (!jobsResponse) throw "no jobs response";
      setJobs(jobsResponse);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar as vagas. Tente novamente mais tarde!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (newJob: Partial<JobT>) => {
    try {
      const jobCreated = await createJob(newJob);

      if (!jobCreated) throw "job is not created successfully";

      setJobs((jobs) => [...jobs, jobCreated]);
      toast.success("Sucesso ao criar a vaga!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao criar a vaga. Tente novamente mais tarde!");
      return false;
    }
  };

  const handleUpdateJob = async (jobId: string, updates: Partial<JobT>) => {
    try {
      const jobUpdated = await updateJob(jobId, updates);

      if (!jobUpdated) throw new Error("job is not updated successfully");

      setJobs((jobs) =>
        jobs.map((job) => (job.id === jobId ? jobUpdated : job))
      );
      toast.success("Sucesso ao editar vaga!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao editar vaga. Tente novamente mais tarde!");
      return false;
    }
  };

  const handleCurateJob = async (jobId: string) => {
    try {
      const jobUpdated = await updateJob(jobId, {
        curated: true,
        is_archived: false,
      });

      if (!jobUpdated) throw new Error("job is not updated successfully");

      setJobs((jobs) =>
        jobs.map((job) => (job.id === jobId ? jobUpdated : job))
      );

      toast.success("Vaga aprovada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao aprovar vaga. Tente novamente mais tarde!");
      return false;
    }
  };

  const handleResendJobToCuration = async (jobId: string) => {
    try {
      const jobUpdated = await updateJob(jobId, {
        curated: false,
        is_archived: false,
      });

      if (!jobUpdated) throw new Error("job is not updated successfully");

      setJobs((jobs) =>
        jobs.map((job) => (job.id === jobId ? jobUpdated : job))
      );

      toast.success("Vaga reenviada a curadoria com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error(
        "Erro ao reenviada vaga a curadoria. Tente novamente mais tarde!"
      );
      return false;
    }
  };

  const handleJobIsOnDiscord = async (jobId: string) => {
    try {
      const jobUpdated = await updateJob(jobId, {
        is_on_discord: true,
      });

      if (!jobUpdated) throw new Error("job is not updated successfully");

      setJobs((jobs) =>
        jobs.map((job) =>
          job.id === jobId ? { ...job, is_on_discord: true } : job
        )
      );

      toast.success("Vaga reenviada a curadoria com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error(
        "Erro ao reenviada vaga a curadoria. Tente novamente mais tarde!"
      );
      return false;
    }
  };

  const handleArchiveJob = async (jobId: string | null) => {
    try {
      if (!jobId) throw new Error("Invalid job ID");

      const response = await updateJob(jobId, {
        curated: false,
        is_archived: true,
      });
      if (!response) throw new Error("failed to update job");

      setJobs((jobs) =>
        jobs.map((job) =>
          job.id === jobId ? { ...job, curated: false, is_archived: true } : job
        )
      );

      toast.success("Vaga arquivada com sucesso!");
      return true;
    } catch (error) {
      console.error("Error to curate job:", error);
      toast.error("Erro ao arquivar a vaga.");
      return false;
    }
  };

  const handleDeleteJob = async (jobId: string | null) => {
    try {
      if (!jobId) throw new Error("Invalid job ID");

      const response = await deleteJob(jobId);

      if (!response) throw new Error("no delete job response");

      setJobs((jobs) => jobs.filter((job) => job.id !== jobId));
      toast.success("Vaga deletada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao deletar vaga. tente novamente mais tarde!");
      return false;
    }
  };

  return {
    jobs,
    jobsLoading: loading,
    handleGetAllJobs,
    handleGetAllCuratedJobs,
    handleCreateJob,
    handleUpdateJob,
    handleCurateJob,
    handleResendJobToCuration,
    handleJobIsOnDiscord,
    handleArchiveJob,
    handleDeleteJob,
  };
};

export default JobsStack;

export interface JobsStackI {
  jobs: JobWithApplicationsT[];
  jobsLoading: boolean;
  handleGetAllJobs: () => Promise<boolean>;
  handleCreateJob: (job: Partial<JobT>) => Promise<boolean>;
  handleUpdateJob: (jobId: string, job: Partial<JobT>) => Promise<boolean>;
  handleDeleteJob: (id: string) => Promise<boolean>;
  handleCurateJob: (jobId: string) => Promise<boolean>;
  handleResendJobToCuration: (jobId: string) => Promise<boolean>;
  handleArchiveJob: (jobId: string) => Promise<boolean>;
  handleJobIsOnDiscord: (jobId: string) => Promise<boolean>;
}

export interface JobsStackAlumniI {
  jobs: JobWithApplicationsT[];
  jobsLoading: boolean;
  handleGetAllCuratedJobs: () => Promise<boolean>;
}