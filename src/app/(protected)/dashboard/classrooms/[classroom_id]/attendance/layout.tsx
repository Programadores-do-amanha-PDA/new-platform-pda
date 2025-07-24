/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";
import PageLoader from "@/components/shared/page-loader";
import { useZoomMeetingPastInstanceStore } from "@/stores/modules/classrooms/zoom/past-instances";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { classroom_id } = useParams<{ classroom_id: string }>();

  if (!classroom_id) {
    return <div>Turma não encontrada.</div>;
  }

  const {
    meetings,
    getAllMeetings,
    loading: meetingsLoading,
  } = useZoomMeetingStore();
  const {
    pastInstances,
    getAllPastInstancesByClassroom,
    loading: pastInstancieLoading,
  } = useZoomMeetingPastInstanceStore();

  useEffect(() => {
    if (meetings.length === 0) {
      getAllMeetings(classroom_id);
    }
    if (pastInstances.length === 0) {
      getAllPastInstancesByClassroom(classroom_id);
    }
  }, [classroom_id]);

  if (meetingsLoading || pastInstancieLoading) return <PageLoader />;

  return children;
}
