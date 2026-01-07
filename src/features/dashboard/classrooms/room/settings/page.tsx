"use client";

import { useParams } from "next/navigation";
import { FolderX } from "lucide-react";

import PermissionGuard from "@/components/shared/permission-guard";
import { NotFoundState } from "@/components/shared/empty-states";

import { useClassroomStore } from "../../classrooms-homepage/store";

import { ModulesList, ClassTypesList, JustificationsList, UserModesList } from "./components";

const ClassroomConfigsPage = () => {
    const { classroomId } = useParams<{ classroomId: string }>();
    const { classrooms } = useClassroomStore();

    const currentClassroom = classrooms.find((classroom) => classroom.id === classroomId);

    if (!classroomId || !currentClassroom)
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
        <div className="flex flex-col gap-8 p-4 w-full h-full overflow-y-auto">
            <PermissionGuard
                permissions={["classrooms.update_all", "classroom_configs.insert", "classroom_configs.update"]}
                fallback={
                    <div className="flex justify-center items-center bg-primary/30 rounded-md w-full h-full overflow-hidden font-semibold text-2xl animate-pulse">
                        Você não tem acesso a essa página.
                    </div>
                }
            >
                <div className="flex flex-wrap gap-6 p-6 w-full">
                    <ModulesList classroomId={currentClassroom.id} />
                    <ClassTypesList classroomId={classroomId} />
                    <JustificationsList classroomId={classroomId} />
                    <UserModesList classroomId={classroomId} />
                </div>
            </PermissionGuard>
        </div>
    );
};

export default ClassroomConfigsPage;
