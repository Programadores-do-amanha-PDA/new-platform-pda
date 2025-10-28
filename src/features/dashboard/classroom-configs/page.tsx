"use client";

import { useClassroomStore } from "../classrooms/stores/classrooms";
import { ModulesList } from "./components/modules";
import { ClassTypesList } from "./components/class-types";
import { useParams } from "next/navigation";
import PermissionGuard from "@/components/shared/permission-guard";
import { JustificationsList } from "./components/justifications";
import { UserModesList } from "./components/user-modes";
import { NotFoundState } from "@/components/shared/empty-states/not-found-state";
import { FolderX } from "lucide-react";

const ClassroomConfigsPage = () => {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const { classrooms } = useClassroomStore();

  const currentClassroom = classrooms.find(
    (classroom) => classroom.id === classroom_id
  );

  if (!classroom_id || !currentClassroom)
    return (
      <NotFoundState
        title="Turma não encontrada"
        description="A turma que você está tentando acessar não foi encontrada."
        icon={<FolderX />}
        buttonText="Voltar para a página inicial"
        href="/dashboard"
      />
    );

  return (
    <div className="w-full h-full flex flex-col gap-8 p-4 overflow-y-auto">
      <PermissionGuard
        permissions={[
          "classrooms.update_all",
          "classroom_configs.insert",
          "classroom_configs.update",
        ]}
        fallback={
          <div className="w-full h-full rounded-md bg-primary/30 overflow-hidden flex items-center justify-center text-2xl font-semibold animate-pulse">
            Você não tem acesso a essa página.
          </div>
        }
      >
        <div className="w-full flex flex-wrap gap-6 p-6">
          <ModulesList classroomId={currentClassroom.id} />
          <ClassTypesList classroomId={classroom_id} />
          <JustificationsList classroomId={classroom_id} />
          <UserModesList classroomId={classroom_id} />
        </div>
      </PermissionGuard>
    </div>
  );
};

export default ClassroomConfigsPage;
