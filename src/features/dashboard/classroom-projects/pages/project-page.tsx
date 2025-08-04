"use client";
import { ArrowLeft, Calendar1, Type } from "lucide-react";
import { useProjectStore } from "@/stores/modules/classrooms/projects";
import { DeliveryDataTable } from "../components/deliveries/delivery-data-table";
import { ClassroomProjectWithDeliveriesAndCorrectionsT } from "@/types";
import { useParams } from "next/navigation";
import { DeleteConfirmationButton } from "@/components/shared/delete-confirmation-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const projectTypesLabels = {
  mini_project: "Mini projeto",
  end_module_project: "Projeto final",
  end_module_english_project: "English final project",
};

export default function ProjectPage() {
  const { project_id, classroom_id } = useParams();
  const { projects, deleteProject } = useProjectStore();

  const currentProject:
    | ClassroomProjectWithDeliveriesAndCorrectionsT
    | undefined = projects.find((project) => project.id === project_id);

  const corrections = currentProject?.corrections || [];
  const deliveries =
    currentProject?.deliveries?.map((delivery) => ({
      ...delivery,
      lastCorrection:
        corrections.find((corr) => corr.delivery_id === delivery.id)
          ?.created_at || null,
    })) || [];

  if (!currentProject) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4 py-6 overflow-hidden">
        <h2 className="font-bold text-2xl text-foreground">
          Projeto não encontrado.
        </h2>
        <p className="text-muted-foreground">
          Verifique se o ID do projeto está correto ou se o projeto esta
          cadastrado na turma.
        </p>
        <Button variant="outline" asChild>
          <Link
            href={`/dashboard/classrooms/${classroom_id}/projects`}
            className="hover:underline font-semibold"
          >
            <ArrowLeft className="mr-2 h-4 w-4 rotate-2" />
            Ver todos os Projetos
          </Link>
        </Button>
      </div>
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
                </span>
              </div>
            )}
        </div>
        <DeleteConfirmationButton
          onConfirm={() => deleteProject(currentProject.id)}
          buttonText="Deletar Projeto"
          dialogTitle="Deletar Projeto"
          description={`Tem certeza que deseja deletar o projeto "${currentProject.title}"? Esta ação não pode ser desfeita e todas as entregas e correções associadas serão permanentemente removidas.`}
          confirmText="Deletar Projeto"
        />
      </header>

      <div className="w-full h-full flex overflow-hidden">
        <DeliveryDataTable
          deliveries={deliveries.sort(
            (a, b) =>
              new Date(a.created_at || 0).getTime() -
              new Date(b.created_at || 0).getTime()
          )}
        />
      </div>
    </div>
  );
}
