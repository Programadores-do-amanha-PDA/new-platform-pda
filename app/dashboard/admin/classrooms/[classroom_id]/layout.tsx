/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import LoadingComponent from "@/components/common/loading-component";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { classroom_id } = useParams<{ classroom_id: string }>();

  if (!classroom_id) {
    return <div>Turma não encontrada.</div>;
  }

  const {
    usersStack: { users, handleGetAllUsersWithProfiles, usersLoading },
    classroomsStack: {
      projects: {
        projects,
        handleGetAllProjectsWithDeliveriesAndCorrectionsByClassroomId,
        projectsLoading,
      },
    },
  } = useAdminStackContext();

  useEffect(() => {
    if (users.length === 0) {
      handleGetAllUsersWithProfiles();
    }
    if (
      projects.filter((project) => project.classroom_id === classroom_id)
        .length === 0
    ) {
      handleGetAllProjectsWithDeliveriesAndCorrectionsByClassroomId(
        classroom_id
      );
    }
  }, [
    users,
    projects,
    classroom_id,
    handleGetAllProjectsWithDeliveriesAndCorrectionsByClassroomId,
    handleGetAllUsersWithProfiles,
    projects.length,
    users.length,
  ]);

  if (usersLoading || projectsLoading) return <LoadingComponent />;

  return children;
};

export default Layout;
