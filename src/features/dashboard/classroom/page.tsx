"use client";

import { useClassroomStore } from "../classrooms/stores/classrooms";
import ClassroomFormDialog from "../classrooms/components/classroom-form-dialog";
import { ModulesList } from "./components/modules";
import { ClassTypesList } from "./components/class-types";
import { useParams } from "next/navigation";
import PermissionGuard from "@/components/shared/permission-guard";
import { JustificationsList } from "./components/justifications";
import { UserModesList } from "./components/user-modes";

const ClassroomHomePage = () => {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const { classrooms } = useClassroomStore();

  if (!classroom_id) return null;

  const currentClassroom = classrooms.find(
    (classroom) => classroom.id === classroom_id
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
        <div className="w-full flex flex-wrap gap-6 p-6">
          <ModulesList classroomId={classroom_id} />
          <ClassTypesList classroomId={classroom_id} />
          <JustificationsList classroomId={classroom_id} />
          <UserModesList classroomId={classroom_id} />
        </div>
      </PermissionGuard>
    </div>
  );
};

export default ClassroomHomePage;
