"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NotFoundState } from "@/components/shared/empty-states/not-found-state";

import { useCorrectionStore } from "../stores/corrections";
import { useDeliveryStore } from "../stores/deliveries";
import { useProjectStore } from "../stores";
import { useUsersStore } from "@/stores/modules/users/users-store";
import ProjectCorrection from "../components/corrections/project-correction";
import { ClassroomProjectDeliveryT } from "../types";
import { cn } from "@/lib/utils";
import { FileCheck2, FileClock } from "lucide-react";

export default function ProjectDeliveriesCorrectionPage() {
  const { classroom_id, project_id } = useParams<{
    classroom_id: string;
    project_id: string;
  }>();

  const [currentDelivery, setCurrentDelivery] =
    useState<ClassroomProjectDeliveryT | null>();

  const { users } = useUsersStore();
  const { projects } = useProjectStore();
  const { corrections } = useCorrectionStore();
  const { deliveries } = useDeliveryStore();

  const currentProject = projects.find((project) => project.id === project_id);
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

  const classroomUsers = users.filter((user) =>
    user?.profile?.classrooms
      ?.map((classroom) => classroom.classroom_id)
      .includes(classroom_id)
  );
  const allProjectDeliveries = deliveries.filter(
    (delivery) => delivery.project_id === project_id
  );
  const allProjectCorrections = corrections.filter(
    (correction) => correction.project_id === project_id
  );

  const handleSelectDelivery = (delivery: ClassroomProjectDeliveryT) => {
    if (currentDelivery?.id === delivery.id) setCurrentDelivery(null);
    else if (currentDelivery?.id !== delivery.id) setCurrentDelivery(delivery);
  };

  const handleClose = () => {
    setCurrentDelivery(null);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 *:p-4 overflow-y-auto">
      <section className="w-full h-max flex flex-col gap-2">
        <h3 className="text-xl font-semibold">Entregas</h3>
        <ul className="w-full h-max pb-4 gap-2 flex overflow-y-auto">
          {allProjectDeliveries
            .sort((a, b) => {
              const aTimestamp = new Date(a.created_at ?? 0).getTime();
              const bTimestamp = new Date(b.created_at ?? 0).getTime();
              return aTimestamp - bTimestamp;
            })
            .map((delivery, deliveryIndex) => {
              const deliveryAuthor = classroomUsers.find(
                (user) => user.id === delivery.user_id
              )?.profile?.full_name;

              const hasDeliveryCorrection = allProjectCorrections.some(
                (correction) => correction.delivery_id === delivery.id
              );
              return (
                <li
                  key={delivery.id}
                  className={cn(
                    "min-w-[400px] max-w-[400px] flex justify-between items-center gap-2 border rounded-lg p-2",
                    delivery.id === currentDelivery?.id &&
                      "border-primary border-2"
                  )}
                  onClick={() => handleSelectDelivery(delivery)}
                >
                  <header className="flex flex-col truncate">
                    <p className="text-sm font-bold truncate">
                      {currentProject.project_type === "mini_project"
                        ? `${deliveryAuthor}`
                        : `Squad ${deliveryIndex + 1}`}
                    </p>
                    <p className="text-muted-foreground text-xs font-semibold">
                      {formatDate(delivery.created_at, "dd/MM/yy", {
                        locale: ptBR,
                      })}
                    </p>
                  </header>
                  <div className="size-8 flex items-center justify-center rounded-full bg-primary">
                    {hasDeliveryCorrection ? (
                      <FileCheck2 className="size-5 stroke-primary-foreground" />
                    ) : (
                      <FileClock className="size-5 stroke-primary-foreground" />
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      </section>
      {currentProject && currentDelivery ? (
        <ProjectCorrection
          classroomId={classroom_id}
          project={currentProject}
          selectedDelivery={currentDelivery}
          handleClose={handleClose}
        />
      ) : (
        <section className="w-full h-full flex flex-col items-center justify-center text-center text-muted-foreground bg-primary/15 text-lg">
          Selecione uma entrega para ver os detalhes e fazer a correção.
        </section>
      )}
    </div>
  );
}
