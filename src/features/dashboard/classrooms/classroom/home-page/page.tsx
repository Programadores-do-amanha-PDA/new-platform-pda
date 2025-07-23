"use client";

import { useClassroomStore } from "@/stores/modules/classrooms";
import ClassroomFormDialog from "../../components/classroom-form-dialog";
import { useParams } from "next/navigation";

const ClassroomHomePage = () => {
  const { classroom_id } = useParams();
  const { classrooms } = useClassroomStore();

  const classroomId = Array.isArray(classroom_id)
    ? classroom_id[0]
    : classroom_id;

  if (!classroomId) return null;

  const currentClassroom = classrooms.find(
    (classroom) => classroom.id === classroomId
  );

  return (
    <div className="w-full h-full flex flex-col gap-8 p-4 pb-0 overflow-hidden">
      <header className="w-full flex flex-row flex-nowrap items-center justify-between gap-4">
        <p className="w-full h-full flex items-center justify-start font-bold text-2xl">
          Visão geral
        </p>
        <ClassroomFormDialog currentClassroom={currentClassroom} />
      </header>

      <div className="w-full h-full bg-primary/55 rounded-md overflow-hidden flex relative">
      </div>
    </div>
  );
};

export default ClassroomHomePage;
