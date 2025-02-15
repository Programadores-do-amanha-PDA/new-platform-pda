"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingComponent from "@/components/loading-component";
import { JobType } from "@/types/jobs";
import { AuthUserWithProfileType } from "@/types/auth";
import { getAllAlumni } from "@/utils/supabase/actions/server/employer/auth_admin";
import {
  deleteJob,
  getAllJobs,
  updateJob,
} from "@/app/actions/jobs";
import { adminDeleteUser } from "@/utils/supabase/actions/auth_admin";

interface EmployerStackContextProps {
  alumniStack: {
    alumni: AuthUserWithProfileType[];
    handleInsertNewAlumni: (alumni: AuthUserWithProfileType) => void;
    handleUpdateAlumni: (
      id: string | undefined,
      alumni: AuthUserWithProfileType
    ) => void;
    handleDeleteAlumni: (id: string | undefined) => void;
  };

  jobsStack: {
    jobs: JobType[];
    setLoading: (loading: boolean) => void;
    handleInsertNewJob: (job: JobType) => void;
    handleUpdateJob: (job: JobType) => void;
    handleDeleteJob: (id: string | null) => Promise<void>;
    handleCurateJob: (jobId: string | null) => Promise<void>;
    handleResendJobToCuration: (jobId: string | null) => Promise<void>;
  };
  loading: boolean;
}

const EmployerStackContext = createContext<EmployerStackContextProps>({
  alumniStack: {
    alumni: [],
    handleInsertNewAlumni: () => {},
    handleUpdateAlumni: () => {},
    handleDeleteAlumni: () => {},
  },

  jobsStack: {
    jobs: [],
    setLoading: () => {},
    handleInsertNewJob: () => {},
    handleUpdateJob: () => {},
    handleDeleteJob: () => Promise.resolve() as Promise<void>,
    handleCurateJob: () => Promise.resolve() as Promise<void>,
    handleResendJobToCuration: () => Promise.resolve() as Promise<void>,
  },
  loading: true,
});

export const EmployerStackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [alumni, setAlumni] = useState<AuthUserWithProfileType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allAlumni = await getAllAlumni();
        if (!allAlumni) throw "no GET /api/alumni returned a status 200";
        setAlumni(allAlumni);

        const jobResponse = await getAllJobs();
        if (!jobResponse) throw "no GET /api/job returned a status 200";
        setJobs(jobResponse);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Alumni
  const handleUpdateAlumni = (
    id: string | undefined,
    userUpdated: AuthUserWithProfileType
  ) => {
    setAlumni((alumni) =>
      alumni.map((alumni) => (alumni.id === id ? { ...userUpdated } : alumni))
    );
  };

  const handleInsertNewAlumni = (newAlumni: AuthUserWithProfileType) => {
    const isAlumniExist = alumni
      .map((alumni) => alumni.id)
      .includes(newAlumni.id);
    if (!isAlumniExist) {
      setAlumni((alumni) => [...alumni, newAlumni]);
    }
  };

  const handleDeleteAlumni = async (id: string | undefined) => {
    try {
      if (!id) throw "alumni id is required to delete";

      const isAlumniExist = alumni.map((alumni) => alumni.id).includes(id);

      const isAlumniDeleted = await adminDeleteUser(id);
      if (!isAlumniDeleted) throw "error on user deleted";

      if (isAlumniExist) {
        setAlumni((alumni) => alumni.filter((alumni) => alumni.id !== id));
      }
    } catch (error) {
      console.log(error);
      toast.error("Erro ao deletar usuário. tente novamente mais tarde!");
    }
  };

  // Jobs
  const handleDeleteJob = async (jobId: string | null) => {
    try {
      if (!jobId) throw new Error("Invalid job ID");
      const response = await deleteJob(jobId);

      if (!response) throw new Error(" failed to delete job");

      const filteredProfiles = jobs.filter((job) => job.id !== jobId);
      setJobs(filteredProfiles);

      toast.success("Vaga deletada com sucesso!");
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

      const response = await updateJob(jobId, {
        curated: true,
      });
      if (!response) throw new Error("failed to update job");

      const filteredProfiles = jobs.map((job) =>
        job.id === jobId ? { ...job, curated: true } : job
      );
      setJobs(filteredProfiles);

      toast.success("Vaga aprovada com sucesso!");
    } catch (error) {
      console.error("Error to curate job:", error);
      toast.error("Erro ao aprovar a vaga.");
    }
  };

  const handleResendJobToCuration = async (jobId: string | null) => {
    try {
      if (!jobId) throw new Error("Invalid job ID");

      const response = await updateJob(jobId, {
        curated: false,
      });

      if (!response) throw new Error("failed to update job");
      const filteredProfiles = jobs.map((job) =>
        job.id === jobId ? { ...job, curated: false } : job
      );
      setJobs(filteredProfiles);

      toast.success("Vaga reenviada para curadoria com sucesso!");
    } catch (error) {
      console.error("Error resend to curation job:", error);
      toast.error("Erro ao reenviar a vaga para a curadoria.");
    }
  };

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <EmployerStackContext.Provider
      value={{
        alumniStack: {
          alumni,
          handleUpdateAlumni,
          handleInsertNewAlumni,
          handleDeleteAlumni,
        },
        jobsStack: {
          jobs,
          setLoading,
          handleInsertNewJob,
          handleUpdateJob,
          handleDeleteJob,
          handleCurateJob,
          handleResendJobToCuration,
        },
        loading,
      }}
    >
      {children}
    </EmployerStackContext.Provider>
  );
};

export const useEmployerStack = () => useContext(EmployerStackContext);
