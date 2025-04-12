/* eslint-disable react-hooks/rules-of-hooks */
"use client";
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
      coodesh: { assessments, handleGetAllCoodeshAssessmentByClassroomId },
    },
  } = useAdminStackContext();

  useEffect(() => {
    if (assessments.length === 0) {
      handleGetAllCoodeshAssessmentByClassroomId(classroom_id);
    }
  }, [classroom_id]);

  return children;
};

export default Layout;
