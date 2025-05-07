"use client";
import LoadingComponent from "@/components/common/loading-component";
import { useEmployerStack } from "@/context/employer/stack-context";
import { useEffect } from "react";

const JobsLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const {
    usersStack: { users, handleGetAllUsersWithProfiles, usersLoading },
  } = useEmployerStack();

  useEffect(() => {
    if (!users.length) {
      handleGetAllUsersWithProfiles("alumni");
    }
  }, []);

  if (usersLoading) {
    return <LoadingComponent />;
  }

  return children;
};
export default JobsLayout;
