"use client";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import LoadingComponent from "@/components/loading-component";
import { JobType } from "@/types/jobs";

interface JobsStackContextProps {
  jobs: JobType[];
  jobsLoading: boolean;
  setJobsLoading: (loading: boolean) => void;
  handleInsertNewJob: (job: JobType) => void;
  handleUpdateJob: (job: JobType) => void;
  handleDeleteJob: (id: string | null) => Promise<void>;
  handleCurateJob: (jobId: string | null) => Promise<void>;
  handleResendJobToCuration: (jobId: string | null) => Promise<void>;
}

const JobsStackContext = createContext<JobsStackContextProps>({
  jobs: [],
  jobsLoading: true,
  setJobsLoading: () => {},
  handleInsertNewJob: () => {},
  handleUpdateJob: () => {},
  handleDeleteJob: () => Promise.resolve() as Promise<void>,
  handleCurateJob: () => Promise.resolve() as Promise<void>,
  handleResendJobToCuration: () => Promise.resolve() as Promise<void>,
});

export const JobsStackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setJobsLoading(true);
      try {
        const response = await axios.get("/api/jobs");
        setJobs(response.data.results);
      } catch (error) {
        console.error(error);
      }

      setJobsLoading(false);
    };

    fetchJobs();
  }, []);

  const handleDeleteJob = async (jobId: string | null) => {
    try {
      if (!jobId) throw new Error("Invalid job ID");
      const response = await axios.delete(`/api/jobs?id=${jobId}`);
      if (response.status === 200) {
        toast.success("Vaga deletada com sucesso!");
        const filteredProfiles = jobs.filter((job) => job.id !== jobId);
        setJobs(filteredProfiles);
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Erro ao deletar a vaga");
    }
  };

  const handleInsertNewJob = (newJob: JobType) => {
    setJobs((jobs) => [...jobs, newJob]);
  };

  const handleUpdateJob = (newJob: JobType) => {
    const updatedJobs = jobs.map((job) =>
      job.id === newJob.id ? newJob : job
    );
    setJobs(updatedJobs);
  };

  const handleCurateJob = async (jobId: string | null) => {
    try {
      if (!jobId) throw new Error("Invalid job ID");
      const data = {
        jobId: jobId,
        updates: {
          curated: true,
        },
      };

      const response = await axios.put(`/api/jobs`, data);
      if (response.status === 200) {
        const filteredProfiles = jobs.map((job) =>
          job.id === jobId ? { ...job, curated: true } : job
        );
        setJobs(filteredProfiles);

        toast.success("Vaga aprovada com sucesso!");
      }
    } catch (error) {
      console.error("Error to curate job:", error);
      toast.error("Erro ao aprovar a vaga.");
    }
  };

  const handleResendJobToCuration = async (jobId: string | null) => {
    try {
      if (!jobId) throw new Error("Invalid job ID");
      const data = {
        jobId: jobId,
        updates: {
          curated: false,
        },
      };

      const response = await axios.put(`/api/jobs`, data);
      if (response.status === 200) {
        const filteredProfiles = jobs.map((job) =>
          job.id === jobId ? { ...job, curated: false } : job
        );
        setJobs(filteredProfiles);

        toast.success("Vaga reenviada para curadoria com sucesso!");
      }
    } catch (error) {
      console.error("Error resend to curation job:", error);
      toast.error("Erro ao reenviar a vaga para a curadoria.");
    }
  };

  if (jobsLoading) {
    return <LoadingComponent />;
  }

  return (
    <JobsStackContext.Provider
      value={{
        jobs,
        jobsLoading,
        setJobsLoading,
        handleInsertNewJob,
        handleUpdateJob,
        handleDeleteJob,
        handleCurateJob,
        handleResendJobToCuration,
      }}
    >
      {children}
    </JobsStackContext.Provider>
  );
};

export const useJobsStackContext = () => useContext(JobsStackContext);
