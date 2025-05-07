"use client";
import LoadingComponent from "@/components/common/loading-component";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { useEffect } from "react";

const JobsLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const {
    usersStack: { users, handleGetAllUsersWithProfiles, usersLoading },
  } = useAdminStackContext();

  useEffect(() => {
    if (!users.length) {
      handleGetAllUsersWithProfiles();
    }
  }, []);

  if (usersLoading) {
    return <LoadingComponent />;
  }

  return children;
};
export default JobsLayout;
