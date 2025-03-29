"use client";
import LoadingComponent from "@/components/loading-component";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { useEffect } from "react";

const JobsLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const {
    jobsStack: { jobs, jobsLoading, handleGetAllJobs },
  } = useAdminStackContext();

  useEffect(() => {
    if (!jobs.length) {
      handleGetAllJobs();
    }
  }, []);

  if (jobsLoading) {
    return <LoadingComponent />;
  }

  return children;
};
export default JobsLayout;
