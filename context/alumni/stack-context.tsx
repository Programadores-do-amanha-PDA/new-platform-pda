"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getAllJobs } from "@/utils/supabase/actions/jobs";

import LoadingComponent from "@/components/loading-component";

import { JobType } from "@/types/jobs";

interface AlumniStackContextProps {
  jobsStack: {
    jobs: JobType[];
    setLoading: (loading: boolean) => void;
  };
  loading: boolean;
}

const AlumniStackContext = createContext<AlumniStackContextProps>({
  jobsStack: {
    jobs: [],
    setLoading: () => {},
  },
  loading: true,
});

export const AlumniStackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const jobResponse = await getAllJobs();
        if (!jobResponse) throw "get all job response is null";
        setJobs(jobResponse);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <AlumniStackContext.Provider
      value={{
        jobsStack: {
          jobs,
          setLoading,
        },
        loading,
      }}
    >
      {children}
    </AlumniStackContext.Provider>
  );
};

export const useEmployerStack = () => useContext(AlumniStackContext);
