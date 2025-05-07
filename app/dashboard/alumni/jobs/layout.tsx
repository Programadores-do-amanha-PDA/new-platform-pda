"use client";
import LoadingComponent from "@/components/common/loading-component";
import { useAlumniStack } from "@/context/alumni/stack-context";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";

const ResumesLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { user } = useAuth();
  const {
    jobsStack: { jobs, jobsLoading, handleGetAllCuratedJobs },
    jobApplicationStack: {
      jobApplications,
      handleGetAllJobsApplicationsByUserId,
      jobsApplicationLoading,
    },
    resumeStack: { resumes, handleGetResumeByUserId, resumesLoading },
  } = useAlumniStack();

  useEffect(() => {
    if (!jobs.length) {
      handleGetAllCuratedJobs();
    }
    if (!jobApplications.length && user) {
      handleGetAllJobsApplicationsByUserId(user);
    }
    if (!resumes.length && user) {
      handleGetResumeByUserId(user);
    }
  }, []);

  if (jobsLoading || jobsApplicationLoading || resumesLoading) {
    return <LoadingComponent />;
  }

  return children;
};
export default ResumesLayout;
