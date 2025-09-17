"use client";
import { useParams } from "next/navigation";
import { Calendar1, Type } from "lucide-react";
import { NotFoundState } from "@/components/shared/not-found-state";
import { DeleteConfirmationButton } from "@/components/shared/delete-confirmation-dialog";
import { useProjectStore } from "@/stores/modules/classrooms/projects";
import { useDeliveryStore } from "@/stores/modules/classrooms/projects/deliveries";
import { useCorrectionStore } from "@/stores/modules/classrooms/projects/corrections";
import { DeliveryDataTable } from "../components/deliveries/delivery-data-table";
import { ClassroomProjectT } from "../types";
import { projectTypesLabels } from "../utils/project-type-labels";
import ProjectDialog from "../components/project-dialog";

export default function ProjectPage() {
  const { project_id, classroom_id } = useParams<{
    project_id: string;
    classroom_id: string;
  }>();
  const { projects, deleteProject } = useProjectStore();
  const { deliveries } = useDeliveryStore();
  const { corrections } = useCorrectionStore();

  const currentProject: ClassroomProjectT | undefined = projects.find(
    (project) => project.id === project_id
  );

  const projectCorrections = corrections.filter(
    (correction) => correction.project_id === project_id
  );
  const projectDeliveries = deliveries
    .filter((delivery) => delivery.project_id === project_id)
    .map((delivery) => ({
      ...delivery,
      lastCorrection:
        projectCorrections.find((corr) => corr.delivery_id === delivery.id)
          ?.created_at || null,
    }));

  if (!currentProject) {
    return (
      <NotFoundState
        title="Projeto não encontrado."
        subtitle="Verifique se o ID do projeto está correto ou se o projeto esta cadastrado na turma."
        href={`/dashboard/classrooms/${classroom_id}/projects`}
        buttonText="Ver todos os Projetos"
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-8 p-4 overflow-y">
      <header className="w-full flex justify-between gap-2">
        <div className="flex items-center gap-4">
          {/* <p className="text-muted-foreground font-semibold">Testes:</p> */}
          <div className="flex items-center gap-1" title="Tipo do projeto">
            <Type className="size-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {projectTypesLabels[currentProject?.project_type]}
            </span>
          </div>
          <div className="flex items-center gap-1" title="Modulo do projeto">
            <p className="text-muted-foreground text-xl font-semibold">M</p>
            <span className="text-muted-foreground">
              {currentProject.module}
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
                  {new Date(
                    currentProject.schedule_date?.from
                  )?.toLocaleDateString("pt-BR", {
                    dateStyle: "short",
                  }) ?? "Não definido"}{" "}
                  {" - "}
                  {new Date(
                    currentProject.schedule_date?.to
                  )?.toLocaleDateString("pt-BR", {
                    dateStyle: "short",
                  }) ?? "Não definido"}
                  {currentProject.closing_time && (
                    <span className="text-xs opacity-75">
                      {" "}
                      às {currentProject.closing_time}
                    </span>
                  )}
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

      <div className="w-full h-full flex overflow-hidden">
        <DeliveryDataTable
          deliveries={projectDeliveries.sort(
            (a, b) =>
              new Date(a.created_at || 0).getTime() -
              new Date(b.created_at || 0).getTime()
          )}
          projectType={currentProject.project_type}
        />
      </div>
    </div>
  );
}
