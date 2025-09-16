"use client";

import { useClassroomStore } from "../classrooms/stores/classrooms";
import ClassroomFormDialog from "../classrooms/components/classroom-form-dialog";
import { ModulesList } from "./components/modules";
import { ClassTypesList } from "./components/class-types";
import { useParams } from "next/navigation";
import PermissionGuard from "@/components/shared/permission-guard";
import { JustificationsList } from "./components/justifications";

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
    <div className="w-full h-full flex flex-col gap-8 p-4 overflow-y-auto">
      <PermissionGuard permission="classrooms.update_all">
        <header className="w-full flex flex-row flex-nowrap items-center justify-end gap-4">
          <ClassroomFormDialog currentClassroom={currentClassroom} />
        </header>
      </PermissionGuard>

      <PermissionGuard
        permission="classrooms.update_all"
        fallback={
          <div className="w-full h-full rounded-md bg-primary/30 overflow-hidden flex items-center justify-center text-2xl font-semibold animate-pulse">
            Mais funcionalidades em breve!
          </div>
        }
      >
        <div className="w-full h-full rounded-md overflow-hidden flex flex-wrap gap-6 p-6">
          <ModulesList classroomId={classroomId} />
          <ClassTypesList classroomId={classroomId} />
          <JustificationsList classroomId={classroomId} />
        </div>
      </PermissionGuard>
    </div>
  );
};

export default ClassroomHomePage;
