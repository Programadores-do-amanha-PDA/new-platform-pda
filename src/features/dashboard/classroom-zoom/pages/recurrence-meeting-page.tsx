"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarMinus,
  CalendarPlus,
  ChevronDownIcon,
  Ellipsis,
  RefreshCw,
  RotateCw,
  Siren,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AsyncActionButton from "@/components/shared/async-action-button";
import { DeleteConfirmationButton } from "@/components/shared/delete-confirmation-dialog";

import {
  useZoomMeetingStore,
  useZoomAccountStore,
  useZoomMeetingPastInstanceStore,
} from "../stores";
import { MeetingDataTable } from "../components/meetings/meeting/meeting-data-table";
import PastInstancieDialog from "../components/meetings/meeting/past-instancie-dialog";
import {
  ZoomMeetingOccurrenceT,
  ZoomMeetingParticipantT,
  ZoomMeetingPastInstanceT,
  ZoomMeetingT,
} from "../types";

type MeetingOccurrence = ZoomMeetingOccurrenceT & {
  topic: string | undefined;
  meeting_id: string | null;
};

type MeetingPastInstance = ZoomMeetingPastInstanceT & {
  topic: string | undefined;
  meeting_id: string | null;
  duration: number | undefined;
  updatePastInstanceById: (
    id: string,
    updates: Partial<ZoomMeetingPastInstanceT>
  ) => Promise<boolean>;
  handleOpenDialog: (instance: string) => void;
  handleRefreshInstanceData: (
    instanceId: string,
    uuid: string
  ) => Promise<void>;
};

const meetingPastInstancesColumns: ColumnDef<MeetingPastInstance>[] = [
  {
    accessorKey: "topic",
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Reunião</p>
          <Button
            variant="ghost"
            className="text-left px-2 font-semibold"
            onClick={() => {
              if (!sortState) {
                column.toggleSorting(false);
              } else if (sortState === "asc") {
                column.toggleSorting(true);
              } else {
                column.clearSorting();
              }
            }}
          >
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary-foreground" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary-foreground" />
            ) : (
              <ArrowUpDown className="stroke-muted-foreground" />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }: { row: { original: MeetingPastInstance } }) => {
      return (
        <div
          className="w-full h-full flex justify-start items-center p-2 border-r border-b cursor-pointer hover:underline"
          onClick={() => row.original.handleOpenDialog(row.original.id)}
        >
          <p className="font-medium">{row.original.topic}</p>
        </div>
      );
    },
  },
  {
    id: "start_time",
    accessorFn: (row) => new Date(row.start_time!).getTime(),
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Data</p>
          <Button
            variant="ghost"
            className="text-left px-2 font-semibold"
            onClick={() => {
              if (!sortState) {
                column.toggleSorting(false);
              } else if (sortState === "asc") {
                column.toggleSorting(true);
              } else {
                column.clearSorting();
              }
            }}
          >
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary-foreground" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary-foreground" />
            ) : (
              <ArrowUpDown className="stroke-muted-foreground" />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
        <p className="font-medium">
          {format(new Date(row.original.start_time!), "dd/MM/yyyy", {
            locale: ptBR,
          })}
        </p>
      </div>
    ),
  },
  {
    id: "duration",
    accessorFn: (row) => row.duration || 0,
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Duração</p>
          <Button
            variant="ghost"
            className="text-left px-2 font-semibold"
            onClick={() => {
              if (!sortState) {
                column.toggleSorting(false);
              } else if (sortState === "asc") {
                column.toggleSorting(true);
              } else {
                column.clearSorting();
              }
            }}
          >
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary-foreground" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary-foreground" />
            ) : (
              <ArrowUpDown className="stroke-muted-foreground" />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const duration = row.original.duration || 0;
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;

      return (
        <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
          <p className="font-medium">
            {hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`}
          </p>
        </div>
      );
    },
  },
  {
    id: "participants",
    accessorFn: (row) => row.participants?.length || 0,
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Participantes</p>
          <Button
            variant="ghost"
            className="text-left px-2 font-semibold"
            onClick={() => {
              if (!sortState) {
                column.toggleSorting(false);
              } else if (sortState === "asc") {
                column.toggleSorting(true);
              } else {
                column.clearSorting();
              }
            }}
          >
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary-foreground" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary-foreground" />
            ) : (
              <ArrowUpDown className="stroke-muted-foreground" />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
        <p className="font-medium">{row.original.participants?.length || 0}</p>
      </div>
    ),
  },
  {
    id: "poll_results",
    accessorFn: (row) => row.poll_results?.length || 0,
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Respostas</p>
          <Button
            variant="ghost"
            className="text-left px-2 font-semibold"
            onClick={() => {
              if (!sortState) {
                column.toggleSorting(false);
              } else if (sortState === "asc") {
                column.toggleSorting(true);
              } else {
                column.clearSorting();
              }
            }}
          >
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary-foreground" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary-foreground" />
            ) : (
              <ArrowUpDown className="stroke-muted-foreground" />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
        <p className="font-medium">
          {row.original.poll_results?.filter(Boolean)?.length || 0}
        </p>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => {
      return (
        <div className="w-full h-full flex justify-center items-center px-2">
          <p>Ações</p>
        </div>
      );
    },
    cell: ({ row }: { row: { original: MeetingPastInstance } }) => (
      <div
        key={row.original.uuid}
        className="w-full h-full flex justify-center items-center border-b"
      >
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Ellipsis className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <AsyncActionButton
                onAction={async () =>
                  void row.original.updatePastInstanceById(row.original.id, {
                    is_visible_on_schedule:
                      !row.original.is_visible_on_schedule,
                  })
                }
                variant="ghost"
                size="icon"
                className="cursor-pointer"
              >
                {row.original.is_visible_on_schedule === undefined ||
                row.original.is_visible_on_schedule === true ? (
                  <CalendarMinus className="size-4 text-destructive" />
                ) : (
                  <CalendarPlus className="size-4 text-primary-foreground" />
                )}
              </AsyncActionButton>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <AsyncActionButton
                onAction={async () =>
                  void row.original.handleRefreshInstanceData(
                    row.original.id,
                    row.original.uuid
                  )
                }
                variant="ghost"
                size="icon"
                className="cursor-pointer"
              >
                <RefreshCw className="size-4 text-primary" />
              </AsyncActionButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

const meetingOccurrencesColumns: ColumnDef<MeetingOccurrence>[] = [
  {
    accessorKey: "topic",
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Reunião</p>
          <Button
            variant="ghost"
            className="text-left px-2 font-semibold"
            onClick={() => {
              if (!sortState) {
                column.toggleSorting(false);
              } else if (sortState === "asc") {
                column.toggleSorting(true);
              } else {
                column.clearSorting();
              }
            }}
          >
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary-foreground" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary-foreground" />
            ) : (
              <ArrowUpDown className="stroke-muted-foreground" />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
        <p className="font-medium">{row.getValue("topic")}</p>
      </div>
    ),
  },
  {
    id: "start_time",
    accessorFn: (row) => new Date(row.start_time).getTime(),
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Data & Hora</p>
          <Button
            variant="ghost"
            className="text-left px-2 font-semibold"
            onClick={() => {
              if (!sortState) {
                column.toggleSorting(false);
              } else if (sortState === "asc") {
                column.toggleSorting(true);
              } else {
                column.clearSorting();
              }
            }}
          >
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary-foreground" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary-foreground" />
            ) : (
              <ArrowUpDown className="stroke-muted-foreground" />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }: { row: { original: MeetingOccurrence } }) => (
      <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
        <p className="font-medium">
          {format(new Date(row.original.start_time), "Pp", { locale: ptBR })}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Status</p>
          <Button
            variant="ghost"
            className="text-left px-2 font-semibold"
            onClick={() => {
              if (!sortState) {
                column.toggleSorting(false);
              } else if (sortState === "asc") {
                column.toggleSorting(true);
              } else {
                column.clearSorting();
              }
            }}
          >
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary-foreground" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary-foreground" />
            ) : (
              <ArrowUpDown className="stroke-muted-foreground" />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }: { row: { original: MeetingOccurrence } }) => (
      <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
        <p className="font-medium">
          {`${row.original.status === "available" ? "Disponível" : "Deletada"}`}
        </p>
      </div>
    ),
  },
  {
    id: "duration",
    accessorFn: (row) => row.duration || 0,
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Duração</p>
          <Button
            variant="ghost"
            className="text-left px-2 font-semibold"
            onClick={() => {
              if (!sortState) {
                column.toggleSorting(false);
              } else if (sortState === "asc") {
                column.toggleSorting(true);
              } else {
                column.clearSorting();
              }
            }}
          >
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary-foreground" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary-foreground" />
            ) : (
              <ArrowUpDown className="stroke-muted-foreground" />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }: { row: { original: MeetingOccurrence } }) => {
      const duration = row.original.duration || 0;
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;

      return (
        <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
          <p className="font-medium">
            {hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`}
          </p>
        </div>
      );
    },
  },
];

export default function ZoomRecurrenceMeetingPage({
  currentMeeting,
}: {
  currentMeeting: ZoomMeetingT;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedInstancie, setSelectedInstancie] =
    useState<ZoomMeetingPastInstanceT | null>(null);

  const { accounts } = useZoomAccountStore();
  const {
    refreshAndAddOnlyNewPastInstances,
    refreshAndUpdateMeeting,
    deleteMeeting,
  } = useZoomMeetingStore();
  const { pastInstances, updatePastInstanceById, refreshInstanceData } =
    useZoomMeetingPastInstanceStore();

  const handleRefreshNewMeetingData = async () => {
    setIsUpdating(true);

    try {
      if (!currentMeeting) throw new Error("Meeting not found");

      const account = accounts.find(
        (account) => account.id === currentMeeting.account_id
      );
      if (!account) return;

      await refreshAndAddOnlyNewPastInstances(currentMeeting, account);

      setIsUpdating(false);
    } catch {
      toast.error("Erro ao atualizar a reunião!");
      setIsUpdating(false);
    }
  };

  const handleRefreshAllMeetingData = async () => {
    setIsUpdating(true);

    try {
      if (!currentMeeting) throw new Error("Meeting not found");

      const account = accounts.find(
        (account) => account.id === currentMeeting.account_id
      );
      if (!account) return;

      await refreshAndUpdateMeeting(currentMeeting, account);

      setIsUpdating(false);
    } catch {
      toast.error("Erro ao atualizar a reunião!");
      setIsUpdating(false);
    }
  };

  const handleOpenDialog = useMemo(
    () => (instancieId: string) => {
      const instancie = pastInstances.find((p) => p.id === instancieId);
      if (!instancie) return toast.error("Instância não encontrada!");
      setSelectedInstancie(instancie);
      setIsDialogOpen(true);
    },
    [pastInstances]
  );

  const handleRefreshInstanceData = useMemo(
    () => async (instanceId: string, uuid: string) => {
      const account = accounts.find(
        (account) => account.id === currentMeeting.account_id
      );
      if (!account) {
        toast.error("Conta não encontrada!");
        return;
      }

      await refreshInstanceData(instanceId, uuid, account);
    },
    [accounts, currentMeeting.account_id, refreshInstanceData]
  );

  const meetingOccurrences = useMemo(
    () =>
      currentMeeting?.occurrences?.filter(Boolean)?.map((occurrence) => ({
        ...occurrence,
        topic: currentMeeting.topic,
        meeting_id: currentMeeting.id,
      })),
    [currentMeeting]
  );

  const meetingPastInstances = useMemo(
    () =>
      pastInstances
        ?.filter(Boolean)
        .filter((p) => p.meeting_id === currentMeeting?.id)
        ?.map((pastInstance) => {
          const participantGroups = new Map<string, ZoomMeetingParticipantT>();

          pastInstance?.participants?.forEach(
            (participant: ZoomMeetingParticipantT) => {
              const existing = participantGroups.get(participant.user_email);
              if (!existing) {
                participantGroups.set(participant.user_email, participant);
              }
            }
          );

          return {
            ...pastInstance,
            topic: currentMeeting?.topic,
            duration: currentMeeting?.duration,
            participants: Array.from(participantGroups.values()),
            updatePastInstanceById,
            handleOpenDialog,
            handleRefreshInstanceData,
          };
        }),
    [
      currentMeeting?.duration,
      currentMeeting?.id,
      currentMeeting?.topic,
      handleOpenDialog,
      handleRefreshInstanceData,
      pastInstances,
      updatePastInstanceById,
    ]
  );

  const currentMeetingOccurrences = meetingOccurrences || [];
  const currentMeetingPastInstances = meetingPastInstances || [];

  return (
    <>
      <div className="w-full h-full p-4 overflow-hidden flex flex-col gap-8">
        <header className="w-full flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground font-semibold flex gap-1">
                Ultima sincronização em:
                <p className="font-normal">
                  {currentMeeting?.synchronized_at &&
                    new Date(
                      currentMeeting.synchronized_at || 0
                    ).toLocaleDateString("pt-BR")}
                </p>
              </p>
              <p className="text-muted-foreground flex gap-1 font-semibold">
                Host:
                <p className="font-normal">{currentMeeting?.host_email}</p>
              </p>
            </div>
            <ButtonGroup>
              <Button
                disabled={isUpdating}
                onClick={handleRefreshNewMeetingData}
                className="font-semibold cursor-pointer border"
              >
                <RotateCw
                  className={cn("size-5", isUpdating && "animate-spin")}
                />
                Buscar novos dados
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="outline"
                    className="border-l-0 rounded-l-none cursor-pointer"
                  >
                    <ChevronDownIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="[--radius:1rem]"
                  autoFocus={false}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Button
                        variant="default"
                        disabled={isUpdating}
                        onClick={handleRefreshAllMeetingData}
                        className="font-semibold cursor-pointer h-max gap-4"
                      >
                        <RefreshCw
                          className={cn("size-5", isUpdating && "animate-spin")}
                        />
                        <div className="flex flex-col items-start">
                          <p>Atualizar todos os dados</p>

                          <p className="text-xs font-normal">
                            Levará cerca de{" "}
                            <mark className="font-semibold bg-transparent">
                              {(
                                (currentMeetingPastInstances.length * 7300) /
                                60000
                              ).toFixed()}{" "}
                              minutos
                            </mark>
                          </p>
                        </div>
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <DeleteConfirmationButton
                        onConfirm={() => deleteMeeting(currentMeeting.id)}
                        buttonText="Deletar Reunião"
                        dialogTitle="Deletar Reunião"
                        description={`Tem certeza que deseja deletar a reunião "${currentMeeting.topic}"? Esta ação não pode ser desfeita e todas as instancias futuras e passadas associadas serão permanentemente removidas juntamente com suas presenças e entregas (polls) a elas vinculadas.`}
                        confirmText="Deletar Reunião"
                        buttonClassName="w-full cursor-pointer"
                      />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </ButtonGroup>
          </div>

          {meetingOccurrences &&
            meetingOccurrences?.filter(
              (m) =>
                new Date(m.start_time).getTime() + m.duration * 60 * 1000 <
                Date.now()
            )?.length > 0 && (
              <Alert variant={"destructive"}>
                <Siren className="size-4" />
                <AlertTitle className="font-semibold">
                  As instancias dessa reunião podem estar desatualizadas!
                </AlertTitle>
                <AlertDescription>
                  Foram encontrados{" "}
                  {
                    meetingOccurrences?.filter(
                      (m) =>
                        new Date(m.start_time).getTime() +
                          m.duration * 60 * 1000 <
                        Date.now()
                    ).length
                  }{" "}
                  instancias desatualizadas, atualize (re-sincronize) os dados
                  desta reunião.
                </AlertDescription>
              </Alert>
            )}
        </header>

        {(currentMeetingOccurrences?.length ||
          currentMeetingPastInstances?.length) && (
          <Tabs
            defaultValue={
              currentMeetingOccurrences.length
                ? "occurrences"
                : "pastInstancies"
            }
            className="w-full h-full flex flex-col overflow-hidden"
          >
            <TabsList className="w-max flex gap-2 overflow-hidden">
              {currentMeetingOccurrences.length > 0 && (
                <TabsTrigger value="occurrences">
                  Reuniões Futuras ({currentMeetingOccurrences.length})
                </TabsTrigger>
              )}

              {currentMeetingPastInstances.length > 0 && (
                <TabsTrigger value="pastInstancies">
                  Reuniões Terminadas ({currentMeetingPastInstances.length})
                </TabsTrigger>
              )}
            </TabsList>

            {currentMeetingOccurrences.length > 0 && (
              <TabsContent
                value="occurrences"
                className="w-full h-full overflow-hidden"
              >
                <MeetingDataTable
                  columns={meetingOccurrencesColumns}
                  data={currentMeetingOccurrences}
                />
              </TabsContent>
            )}

            {currentMeetingPastInstances && (
              <TabsContent
                value="pastInstancies"
                className="w-full h-full overflow-hidden"
              >
                <MeetingDataTable
                  columns={meetingPastInstancesColumns}
                  data={currentMeetingPastInstances}
                />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>

      {selectedInstancie && (
        <PastInstancieDialog
          instancie={selectedInstancie}
          open={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedInstancie(null);
          }}
        />
      )}
    </>
  );
}
