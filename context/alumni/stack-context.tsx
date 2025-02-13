"use client";
import { createContext, useContext, useEffect, useState } from "react";

import { getAllJobs } from "@/utils/supabase/actions/server/alumni/jobs";
import {
  createJobApplication,
  getAllJobApplicationsByUserId,
} from "@/utils/supabase/actions/server/job_applications";

import LoadingComponent from "@/components/loading-component";

import { JobApplication, JobType } from "@/types/jobs";
import { AuthUserWithProfileType } from "@/types/auth";
import { toast } from "sonner";

interface AlumniStackContextProps {
  jobsStack: {
    jobs: JobType[];
  };

  jobApplicationStack: {
    jobApplications: JobApplication[];
    handleCreateJobApplication: (
      applicationData: JobApplication
    ) => Promise<boolean>;
  };

  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const AlumniStackContext = createContext<AlumniStackContextProps>({
  jobsStack: {
    jobs: [],
  },
  jobApplicationStack: {
    jobApplications: [],
    handleCreateJobApplication: () => Promise.resolve(false),
  },
  loading: true,
  setLoading: () => {},
});

export const AlumniStackProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AuthUserWithProfileType;
}) => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!user.id) throw "user id is null";

        const jobResponse = await getAllJobs();
        if (!jobResponse) throw "get all job response is null";
        setJobs(jobResponse);

        const jobApplicationsResponse = await getAllJobApplicationsByUserId(
          user.id
        );
        if (!jobApplicationsResponse)
          throw "get all job applications response is null";
        setJobApplications(jobApplicationsResponse);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const handleCreateJobApplication = async (
    applicationData: JobApplication
  ) => {
    try {
      if (!user.id || !applicationData.job_id || !applicationData.status)
        throw "user id and job id is required";

      const application = await createJobApplication({
        ...applicationData,
        user_id: user.id,
      });
      if (!application) throw "create job application response is null";

      setJobApplications([...jobApplications, application]);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao declarar a aplicação! Tente recarregar a pagina!");
      return false;
    }
  };

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <AlumniStackContext.Provider
      value={{
        jobsStack: {
          jobs,
        },
        jobApplicationStack: {
          jobApplications,
          handleCreateJobApplication,
        },
        setLoading,
        loading,
      }}
    >
      {children}
    </AlumniStackContext.Provider>
  );
};

export const useAlumniStack = () => useContext(AlumniStackContext);
