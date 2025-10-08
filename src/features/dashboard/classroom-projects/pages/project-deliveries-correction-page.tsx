"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUsersStore } from "@/stores/modules/users/users-store";
import { NotFoundState } from "@/components/shared/empty-states/not-found-state";

import { useCorrectionStore } from "../stores/corrections";
import { useDeliveryStore } from "../stores/deliveries";
import { useProjectStore } from "../stores";
import ProjectCorrection from "../components/corrections/correction-form";
import { DeliveryListItem } from "../components/deliveries/delivery-list-item";
import { ClassroomProjectDeliveryT } from "../types";
import ButtonGroupInput from "@/components/shared/button-group-input";
import EmptyState from "@/components/shared/empty-states/empty-state";
import { Mail, Wand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { getEmptyStateConfig } from "../utils/corrections/empty-states";
import SendDeliveriesFeedbackEmailModal from "../components/corrections/send-delivery-modal";

export default function ProjectDeliveriesCorrectionPage() {
  const { classroom_id, project_id } = useParams<{
    classroom_id: string;
    project_id: string;
  }>();
  const [searchDelivery, setSearchDelivery] = useState<string>("");
  const [currentDelivery, setCurrentDelivery] =
    useState<ClassroomProjectDeliveryT | null>();
  const [
    isSendDeliveryFeedbackEmailModalOpen,
    setIsSendDeliveryFeedbackEmailModalOpen,
  ] = useState<boolean>(false);

  const deliveryListRef = useRef<HTMLUListElement>(null);
  const deliveryItemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const { users } = useUsersStore();
  const { projects } = useProjectStore();
  const { corrections } = useCorrectionStore();
  const { deliveries } = useDeliveryStore();

  const currentProject = projects.find((project) => project.id === project_id);
  const classroomUsers = users.filter((user) =>
    user?.profile?.classrooms
      ?.map((classroom) => classroom.classroom_id)
      .includes(classroom_id)
  );
  const classroomDeliveries = deliveries[classroom_id];
  const classroomCorrections = corrections[classroom_id];

  const allProjectDeliveries = classroomDeliveries
    ?.filter((delivery) => delivery.project_id === project_id)
    ?.sort((a, b) => {
      const aTimestamp = new Date(a.created_at ?? 0).getTime();
      const bTimestamp = new Date(b.created_at ?? 0).getTime();
      return aTimestamp - bTimestamp;
    });
  const allProjectCorrections = classroomCorrections?.filter(
    (correction) => correction.project_id === project_id
  );
  const filteredDeliveries = useCallback(
    () =>
      allProjectDeliveries?.filter((delivery) => {
        const deliveryAuthor = classroomUsers?.find(
          (user) => user.id === delivery.user_id
        )?.profile;

        return (
          deliveryAuthor?.full_name
            .toLowerCase()
            .includes(searchDelivery.toLowerCase()) ||
          deliveryAuthor?.email
            .toLowerCase()
            .includes(searchDelivery.toLowerCase()) ||
          deliveryAuthor?.classrooms?.some((c) =>
            c.short_id.toLowerCase().includes(searchDelivery.toLowerCase())
          )
        );
      }),
    [allProjectDeliveries, classroomUsers, searchDelivery]
  );
  const firstUncorrectedDelivery = allProjectDeliveries?.find((delivery) => {
    const hasDeliveryCorrection = allProjectCorrections.some(
      (correction) => correction.delivery_id === delivery.id
    );
    return !hasDeliveryCorrection;
  });

  const emptyStateConfig = getEmptyStateConfig(
    allProjectDeliveries!,
    allProjectCorrections!,
    currentProject!
  );

  const handleSelectDelivery = (delivery: ClassroomProjectDeliveryT) => {
    if (currentDelivery?.id === delivery.id) setCurrentDelivery(null);
    else if (currentDelivery?.id !== delivery.id) setCurrentDelivery(delivery);
  };
  const handleOpenSendDeliveryFeedbackEmailModal = () => {
    setCurrentDelivery(null);
    setIsSendDeliveryFeedbackEmailModalOpen(true);
  };

  // Scroll to selected delivery when currentDelivery changes
  useEffect(() => {
    if (currentDelivery && deliveryListRef.current) {
      const selectedElement = deliveryItemRefs.current.get(currentDelivery.id);
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentDelivery]);

  const handleClose = () => {
    setCurrentDelivery(null);
  };

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

  return (
    <div className="w-full h-full flex flex-col gap-6 *:p-4 overflow-y-auto">
      <header className="w-full h-max flex flex-col gap-4">
        <div className="flex flex-row justify-between">
          <h3 className="text-xl font-semibold">Entregas</h3>

          <ButtonGroupInput
            inputProps={{
              className: "w-full",
              placeholder: "Procurando por alguém?",
              value: searchDelivery,
              onChange: (e) => setSearchDelivery(e.target.value),
            }}
            buttonGroupProps={{
              className: "max-w-sm w-full",
            }}
            buttonProps={{
              variant: "outline",
            }}
          />
        </div>
        <ul
          ref={deliveryListRef}
          className="w-full h-max pb-4 gap-2 flex overflow-y-auto"
        >
          {filteredDeliveries().map((delivery, deliveryIndex) => {
            const deliveryAuthor = classroomUsers.find(
              (user) => user.id === delivery.user_id
            )?.profile;

            const deliveryCorrection = allProjectCorrections.find(
              (correction) => correction.delivery_id === delivery.id
            );
            return (
              <li
                key={delivery.id}
                ref={(el) => {
                  if (el) {
                    deliveryItemRefs.current.set(delivery.id, el);
                  } else {
                    deliveryItemRefs.current.delete(delivery.id);
                  }
                }}
              >
                <DeliveryListItem
                  delivery={delivery}
                  deliveryIndex={deliveryIndex}
                  deliveryAuthor={deliveryAuthor}
                  projectType={currentProject.project_type}
                  correction={deliveryCorrection}
                  isSelected={delivery.id === currentDelivery?.id}
                  onSelect={handleSelectDelivery}
                />
              </li>
            );
          })}
        </ul>
      </header>
      {currentProject && currentDelivery ? (
        <ProjectCorrection
          classroomId={classroom_id}
          project={currentProject}
          selectedDelivery={currentDelivery}
          handleClose={handleClose}
        />
      ) : (
        <section className="w-full h-full flex flex-col items-center justify-center border-t">
          <EmptyState
            icon={emptyStateConfig.icon}
            title={emptyStateConfig.title}
            description={emptyStateConfig.description}
            action={
              <>
                <ButtonGroup>
                  {firstUncorrectedDelivery && (
                    <Button
                      variant="default"
                      className="cursor-pointer"
                      onClick={() =>
                        handleSelectDelivery(firstUncorrectedDelivery)
                      }
                    >
                      <Wand />
                      {allProjectCorrections?.length === 0
                        ? "Começar a corrigir!"
                        : "Continuar corrigindo!"}
                    </Button>
                  )}

                  {allProjectCorrections.length > 0 && (
                    <Button
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={handleOpenSendDeliveryFeedbackEmailModal}
                    >
                      <Mail />
                      Enviar feedbacks
                    </Button>
                  )}
                </ButtonGroup>
              </>
            }
          />
        </section>
      )}

      {!currentDelivery && isSendDeliveryFeedbackEmailModalOpen && (
        <SendDeliveriesFeedbackEmailModal
          open={isSendDeliveryFeedbackEmailModalOpen}
          deliveries={allProjectDeliveries}
          corrections={allProjectCorrections}
          project={currentProject}
          setClose={() => setIsSendDeliveryFeedbackEmailModalOpen(false)}
        />
      )}
    </div>
  );
}
