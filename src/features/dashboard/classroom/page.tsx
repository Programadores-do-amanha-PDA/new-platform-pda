"use client";

import { useClassroomStore } from "../classrooms/stores/classrooms";
import ClassroomFormDialog from "../classrooms/components/classroom-form-dialog";
import { ModulesList } from "./components/modules";
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
    <div className="w-full h-full flex flex-col gap-8 p-4 overflow-hidden">
      <header className="w-full flex flex-row flex-nowrap items-center justify-end gap-4">
        <ClassroomFormDialog currentClassroom={currentClassroom} />
      </header>

      <div className="w-full h-full rounded-md overflow-hidden flex p-6">
        <ModulesList classroomId={classroomId} />
      </div>
    </div>
  );
};

export default ClassroomHomePage;
