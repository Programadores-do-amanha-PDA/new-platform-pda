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
      zoom: {
        meetings: { meetings, meetingsLoading, handleGetAllZoomMeetings },
      },
    },
  } = useAdminStackContext();

  useEffect(() => {
    if (meetings.length === 0) {
      handleGetAllZoomMeetings(classroom_id);
    }
  }, [classroom_id]);

  if (meetingsLoading) return <LoadingComponent />;

  return children;
};

export default Layout;
