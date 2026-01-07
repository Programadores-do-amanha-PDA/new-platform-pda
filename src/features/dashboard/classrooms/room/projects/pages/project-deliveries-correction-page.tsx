"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useUsersStore } from "@/features/dashboard/shared/users/store";
import { NotFoundState } from "@/components/shared/empty-states/not-found-state";

import { useClassroomProjectCorrectionsStore } from "../stores/corrections";
import { useClassroomProjectDeliveriesStore } from "../stores/deliveries";
import { useClassroomProjectStore } from "../stores";
import ProjectCorrection from "../components/corrections/correction-form";
import { DeliveryListItem } from "../components/deliveries/delivery-list-item";
import { ClassroomProjectDelivery, GroupedDelivery } from "../types";
import ButtonGroupInput from "@/components/shared/button-group-input";
import EmptyState from "@/components/shared/empty-states/empty-state";
import { Mail, Wand, Users, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { getEmptyStateConfig } from "../utils/corrections/empty-states";
import SendDeliveriesFeedbackEmailModal from "../components/corrections/send-delivery-modal";
import {
  groupDeliveriesByIndividual,
  groupDeliveriesBySquad,
} from "../utils/deliveries/delivery-grouping";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFirstLastInitials } from "@/utils/get-first-last-initials";
import RenderSquadMembers from "../components/deliveries/render-squad-members";

export default function ProjectDeliveriesCorrectionPage() {
  const { classroom_id, project_id } = useParams<{
    classroom_id: string;
    project_id: string;
  }>();
  const [searchDelivery, setSearchDelivery] = useState<string>("");
  const [currentDelivery, setCurrentDelivery] =
    useState<ClassroomProjectDelivery | null>();
  const [selectedGroup, setSelectedGroup] = useState<GroupedDelivery | null>(
    null
  );
  const [
    isSendDeliveryFeedbackEmailModalOpen,
    setIsSendDeliveryFeedbackEmailModalOpen,
  ] = useState<boolean>(false);

  const deliveryItemRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const groupListRef = useRef<HTMLUListElement>(null);
  const groupListRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const { users } = useUsersStore();
  const { projects } = useClassroomProjectStore();
  const { corrections } = useClassroomProjectCorrectionsStore();
  const { deliveries } = useClassroomProjectDeliveriesStore();

  const currentProject = projects.find((project) => project.id === project_id);
  const classroomUsers = users.filter((user) =>
    user?.profile?.enrollments
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

  // Agrupar entregas baseado no tipo de projeto
  const groupedDeliveries = useMemo(() => {
    if (!allProjectDeliveries || !currentProject) return [];

    let grouped;
    if (currentProject.project_type === "mini_project") {
      grouped = groupDeliveriesByIndividual(
        allProjectDeliveries,
        classroomUsers
      );
    } else if (
      currentProject.project_type === "end_module_project" ||
      currentProject.project_type === "end_module_english_project"
    ) {
      grouped = groupDeliveriesBySquad(allProjectDeliveries, classroomUsers);
    }
    return grouped || [];
  }, [allProjectDeliveries, classroomUsers, currentProject]);

  // Filtrar grupos baseado na busca
  const filteredGroups = useMemo(() => {
    if (!searchDelivery) return groupedDeliveries;

    return groupedDeliveries.filter((group) => {
      const user = group.user;
      const searchLower = searchDelivery.toLowerCase();

      // Buscar por nome, email do usuário principal
      const userMatches =
        user?.profile?.full_name?.toLowerCase().includes(searchLower) ||
        user?.email?.toLowerCase().includes(searchLower) ||
        user?.email?.toLowerCase().includes(searchLower);

      // Para projetos finais, buscar também pelos membros da squad
      if (
        currentProject?.project_type === "end_module_project" ||
        currentProject?.project_type === "end_module_english_project"
      ) {
        const squadMatches = group.squadMembers?.some((memberId) => {
          const member = classroomUsers.find((u) => u.id === memberId);
          return (
            member?.profile?.full_name?.toLowerCase().includes(searchLower) ||
            member?.email?.toLowerCase().includes(searchLower)
          );
        });

        return userMatches || squadMatches;
      }

      return userMatches;
    });
  }, [groupedDeliveries, searchDelivery, currentProject, classroomUsers]);

  // Entregas do grupo selecionado ou todas se nenhum grupo selecionado
  const displayedDeliveries = selectedGroup
    ? selectedGroup?.deliveries?.sort((a, b) => {
        const aTimestamp = new Date(a.created_at ?? 0).getTime();
        const bTimestamp = new Date(b.created_at ?? 0).getTime();
        return aTimestamp - bTimestamp;
      })
    : allProjectDeliveries?.sort((a, b) => {
        const aTimestamp = new Date(a.created_at ?? 0).getTime();
        const bTimestamp = new Date(b.created_at ?? 0).getTime();
        return aTimestamp - bTimestamp;
      }) || [];

  const firstUncorrectedDelivery = displayedDeliveries?.find((delivery) => {
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

  const handleSelectDelivery = (delivery: ClassroomProjectDelivery) => {
    if (currentDelivery?.id === delivery.id) {
      setCurrentDelivery(null);
    } else if (currentDelivery?.id !== delivery.id) {
      setCurrentDelivery(delivery);

      // Find and select the group that contains this delivery
      const deliveryGroup = groupedDeliveries.find((group) =>
        group.deliveries.some((d) => d.id === delivery.id)
      );

      if (deliveryGroup && selectedGroup?.userId !== deliveryGroup.userId) {
        setSelectedGroup(deliveryGroup);
      }
    }
  };

  const handleSelectGroup = (group: GroupedDelivery) => {
    if (selectedGroup?.userId === group.userId) {
      setSelectedGroup(null);
      setCurrentDelivery(null);
    } else {
      setSelectedGroup(group);
      setCurrentDelivery(null);
    }
  };

  const handleOpenSendDeliveryFeedbackEmailModal = () => {
    setCurrentDelivery(null);
    setIsSendDeliveryFeedbackEmailModalOpen(true);
  };

  // Função para obter o status geral de um grupo
  const getGroupStatus = (group: GroupedDelivery) => {
    const groupCorrections = group.deliveries
      .map((delivery) =>
        allProjectCorrections.find(
          (correction) => correction.delivery_id === delivery.id
        )
      )
      .filter(Boolean);

    if (groupCorrections.length === 0) return "pending";
    if (groupCorrections.length === group.deliveries.length) {
      return groupCorrections.every(
        (correction) => correction?.has_feedback_sent
      )
        ? "sent"
        : "corrected";
    }
    return "partial";
  };

  // Função para renderizar ícone de status
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Mail className="stroke-2 stroke-blue-600 size-4" />;
      case "corrected":
        return <Wand className="stroke-2 stroke-green-600 size-4" />;
      case "partial":
        return <Clock className="stroke-2 stroke-amber-400 size-4" />;
      default:
        return <Clock className="stroke-2 stroke-amber-400 size-4" />;
    }
  };

  // Scroll to selected group when selectedGroup changes
  useEffect(() => {
    if (selectedGroup && groupListRef.current) {
      const selectedElement = groupListRefs.current.get(selectedGroup.userId);
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [selectedGroup]);

  // Scroll to selected delivery when currentDelivery changes
  useEffect(() => {
    if (currentDelivery) {
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

  const handleCloseCorrectionModal = () => {
    setCurrentDelivery(null);
    setIsSendDeliveryFeedbackEmailModalOpen(false);
    setSelectedGroup(null);
  };

    const handleUnselectGroup = () => {
    setCurrentDelivery(null);
    setIsSendDeliveryFeedbackEmailModalOpen(false);
    setSelectedGroup(null);
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
    <div className="flex flex-col gap-6 *:p-4 w-full h-full overflow-y-auto">
      <header className="flex flex-col gap-4 w-full h-max">
        <section className="flex flex-row justify-between">
          <h3 className="font-semibold text-xl">
            {currentProject.project_type === "mini_project"
              ? "Usuários"
              : "Squads"}
          </h3>

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
        </section>
        <section className="flex flex-col w-full">
          {/* Lista de Grupos */}
          <ul
            ref={groupListRef}
            className="flex gap-2 pb-4 w-full h-max overflow-x-auto"
          >
            {filteredGroups.map((group, groupIndex) => {
              const isGroupSelected = selectedGroup?.userId === group.userId;
              const groupStatus = getGroupStatus(group);
              const latestDelivery = group.deliveries.sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )[0];

              return (
                <li
                  key={group.userId}
                  className="flex-shrink-0"
                  ref={(el) => {
                    if (el) {
                      groupListRefs.current.set(group.userId, el);
                    } else {
                      groupListRefs.current.delete(group.userId);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "hover:bg-accent/50 p-3 border rounded-lg min-w-xs max-w-md transition-colors cursor-pointer",
                      isGroupSelected && "border-2 border-primary bg-accent/25"
                    )}
                    onClick={() => handleSelectGroup(group)}
                  >
                    <div className="flex justify-between items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {currentProject.project_type === "mini_project" ? (
                          <>
                            <Avatar className="size-8">
                              <AvatarImage
                                src={group.user?.profile?.avatar_url || ""}
                              />
                              <AvatarFallback className="text-xs">
                                {getFirstLastInitials(
                                  group.user?.profile?.full_name || ""
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm truncate">
                                {group.user?.profile?.full_name ||
                                  "Nome não disponível"}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <Users className="size-5" />
                            <span className="font-medium text-sm">
                              Squad {groupIndex + 1}
                            </span>
                          </>
                        )}
                      </div>
                      {renderStatusIcon(groupStatus)}
                    </div>

                    {currentProject.project_type !== "mini_project" &&
                      group.squadMembers && (
                        <div className="mb-2">
                          <RenderSquadMembers
                            classroomUsers={classroomUsers}
                            squadMembers={group.squadMembers}
                          />
                        </div>
                      )}

                    <div className="flex justify-between items-center text-muted-foreground text-xs">
                      <span>{group.deliveries.length} entregas</span>
                      {latestDelivery && (
                        <span>
                          {new Intl.DateTimeFormat("pt-BR", {
                            dateStyle: "short",
                          }).format(new Date(latestDelivery.created_at))}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Lista de Entregas do Grupo Selecionado */}
          {selectedGroup && (
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Entregas</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUnselectGroup}
                >
                  <X className="size-4" />
                </Button>
              </div>
              <ul className="flex gap-2 pb-4 w-full h-max overflow-x-auto">
                {displayedDeliveries.map((delivery, deliveryIndex) => {
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
                        correction={deliveryCorrection}
                        isSelected={delivery.id === currentDelivery?.id}
                        onSelect={handleSelectDelivery}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </header>
      {currentProject && currentDelivery ? (
        <ProjectCorrection
          classroomId={classroom_id}
          project={currentProject}
          selectedDelivery={currentDelivery}
          handleClose={handleCloseCorrectionModal}
        />
      ) : (
        <section className="flex flex-col justify-center items-center border-t w-full h-full">
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
