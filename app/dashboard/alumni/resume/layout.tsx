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
    resumeStack: { resumes, handleGetResumeByUserId, resumesLoading },
  } = useAlumniStack();

  useEffect(() => {
    if (!resumes.length && user) {
      handleGetResumeByUserId(user);
    }
  }, []);

  if (resumesLoading) {
    return <LoadingComponent />;
  }

  return children;
};
export default ResumesLayout;
