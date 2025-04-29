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
    classroomsStack: {
      projects: {
        projects,
        projectsLoading,
        handleGetAllProjectsWithDeliveriesAndCorrectionsByClassroomId,
      },
    },
  } = useAdminStackContext();

  useEffect(() => {
    if (projects.length === 0) {
      handleGetAllProjectsWithDeliveriesAndCorrectionsByClassroomId(
        classroom_id
      );
    }
  }, [classroom_id]);

  if (projectsLoading) return <LoadingComponent />;

  return children;
};

export default Layout;
