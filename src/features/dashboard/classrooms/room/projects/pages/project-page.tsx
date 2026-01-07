"use client";
// global imports
import { useParams } from "next/navigation";
import { Calendar1, Type } from "lucide-react";
import { NotFoundState } from "@/components/shared/empty-states/not-found-state";
import { DeleteConfirmationButton } from "@/components/shared/delete-confirmation-dialog";

// local imports
import { GroupedDeliveryTable } from "../components/deliveries/grouped-delivery-table";
import ProjectDialog from "../components/project/project-dialog";
import { ClassroomProject } from "../types";
import { projectTypesLabels } from "../utils/projects/project-type-labels";
import { useClassroomProjectDeliveriesStore } from "../stores/deliveries";
import { useClassroomProjectStore } from "../stores";
import { useClassroomProjectCorrectionsStore } from "../stores/corrections";
import { useClassroomSettingStore } from "../../settings";

export default function ProjectPage() {
  const { project_id, classroom_id } = useParams<{
    project_id: string;
    classroom_id: string;
  }>();
  const { settingsByClassroom } = useClassroomSettingStore();
  const { projects, deleteProject } = useClassroomProjectStore();
  const { deliveries } = useClassroomProjectDeliveriesStore();
  const { corrections } = useClassroomProjectCorrectionsStore();

  const currentProject: ClassroomProject | undefined = projects.find(
    (project) => project.id === project_id
  );
  if (!currentProject) {
    return (
      <NotFoundState
        title="Projeto não encontrado."
        description="Verifique se o ID do projeto está correto ou se o projeto esta cadastrado na turma."
        href={`/dashboard/classrooms/${classroom_id}/projects`}
        buttonText="Ver todos os Projetos"
      />
    );
  }

  const classroomDeliveries = deliveries[classroom_id];
  const classroomCorrections = corrections[classroom_id];
  const classroomModules = settingsByClassroom[classroom_id].modules || [];

  const projectCorrections = classroomCorrections?.filter(
    (correction) => correction.project_id === project_id
  );
  const projectDeliveriesWithLastCorrection = classroomDeliveries
    ?.filter((delivery) => delivery.project_id === project_id)
    .map((delivery) => ({
      ...delivery,
      lastCorrection:
        projectCorrections.find((corr) => corr.delivery_id === delivery.id)
          ?.created_at || null,
    }));

  return (
    <div className="flex flex-col gap-8 p-4 w-full h-full overflow-y">
      <header className="flex flex-wrap justify-between gap-2 w-full">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1" title="Tipo do projeto">
            <Type className="size-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {projectTypesLabels[currentProject?.project_type]?.label}
            </span>
          </div>
          <div className="flex items-center gap-1" title="Modulo do projeto">
            <p className="font-semibold text-muted-foreground text-xl">M</p>
            <span className="text-muted-foreground">
              {classroomModules.find(
                (module) => module.id === currentProject.module
              )?.title || currentProject.module}
            </span>
          </div>
          {currentProject.schedule_date?.from &&
            currentProject.schedule_date.to && (
              <div
                className="flex items-center gap-1 truncate"
                title="Período de entregas do projeto"
              >
                <Calendar1 className="size-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {new Date(currentProject.schedule_date?.from)?.toLocaleString(
                    "pt-BR",
                    {
                      dateStyle: "short",
                      timeStyle: "short",
                    }
                  ) ?? "Não definido"}{" "}
                  {" - "}
                  {new Date(currentProject.schedule_date?.to)?.toLocaleString(
                    "pt-BR",
                    {
                      dateStyle: "short",
                      timeStyle: "short",
                    }
                  ) ?? "Não definido"}
                </span>
              </div>
            )}
        </div>
        <div className="flex gap-4">
          <ProjectDialog
            classroom_id={classroom_id}
            currentProject={currentProject}
          />
          <DeleteConfirmationButton
            onConfirm={() => deleteProject(currentProject.id)}
            buttonText="Deletar Projeto"
            dialogTitle="Deletar Projeto"
            description={`Tem certeza que deseja deletar o projeto "${currentProject.title}"? Esta ação não pode ser desfeita e todas as entregas e correções associadas serão permanentemente removidas.`}
            confirmText="Deletar Projeto"
          />
        </div>
      </header>

      <div className="flex w-full h-full overflow-hidden">
        <GroupedDeliveryTable
          deliveries={projectDeliveriesWithLastCorrection.sort(
            (a, b) =>
              new Date(a.created_at || 0).getTime() -
              new Date(b.created_at || 0).getTime()
          )}
          projectType={currentProject.project_type}
          classroomId={classroom_id}
          projectId={currentProject.id}
          corrections={projectCorrections}
        />
      </div>
    </div>
  );
}
