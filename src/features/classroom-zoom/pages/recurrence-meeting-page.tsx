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
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmationButton } from "@/components/shared/delete-confirmation-dialog";

import { MeetingDataTable } from "../components/meetings/meeting/meeting-data-table";
import PastInstancieDialog from "../components/meetings/meeting/past-instancie-dialog";
import { useZoomAccountStore } from "../stores/accounts";
import { useZoomMeetingStore } from "../stores/meetings";
import { useZoomMeetingPastInstanceStore } from "../stores/past-instances";
import { ZoomMeetingOccurrenceT, ZoomMeeting, ZoomMeetingParticipant } from "../types/meetings";
import { ZoomMeetingPastInstance } from "../types/past-instances";

type MeetingOccurrence = ZoomMeetingOccurrenceT & {
    topic: string | undefined;
    meeting_id: string | null;
};

type MeetingPastInstance = ZoomMeetingPastInstance & {
    topic: string | undefined;
    meeting_id: string | null;
    duration: number | undefined;
    updatePastInstanceById: (id: string, updates: Partial<ZoomMeetingPastInstance>) => Promise<boolean>;
    handleOpenDialog: (instance: string) => void;
    handleRefreshInstanceData: (instanceId: string, uuid: string) => Promise<void>;
};

const meetingPastInstancesColumns: ColumnDef<MeetingPastInstance>[] = [
    {
        accessorKey: "topic",
        header: ({ column }) => {
            const sortState = column.getIsSorted();
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Reunião</p>
                    <Button
                        variant="ghost"
                        className="px-2 font-semibold text-left"
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
                    className="flex justify-start items-center p-2 border-r border-b w-full h-full hover:underline cursor-pointer"
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
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Data</p>
                    <Button
                        variant="ghost"
                        className="px-2 font-semibold text-left"
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
            <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
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
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Duração</p>
                    <Button
                        variant="ghost"
                        className="px-2 font-semibold text-left"
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
                <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                    <p className="font-medium">{hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`}</p>
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
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Participantes</p>
                    <Button
                        variant="ghost"
                        className="px-2 font-semibold text-left"
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
            <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
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
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Respostas</p>
                    <Button
                        variant="ghost"
                        className="px-2 font-semibold text-left"
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
            <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                <p className="font-medium">{row.original.poll_results?.filter(Boolean)?.length || 0}</p>
            </div>
        ),
    },
    {
        id: "actions",
        header: () => {
            return (
                <div className="flex justify-center items-center px-2 w-full h-full">
                    <p>Ações</p>
                </div>
            );
        },
        cell: ({ row }: { row: { original: MeetingPastInstance } }) => (
            <div key={row.original.uuid} className="flex justify-center items-center border-b w-full h-full">
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Ellipsis className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="space-y-1">
                        <DropdownMenuItem
                            onClick={async () => {
                                try {
                                    await row.original.updatePastInstanceById(row.original.id, {
                                        is_visible_on_schedule: !row.original.is_visible_on_schedule,
                                    });
                                } catch (error) {
                                    console.error("Error updating visibility:", error);
                                }
                            }}
                            className="cursor-pointer"
                            variant={
                                row.original.is_visible_on_schedule === undefined ||
                                row.original.is_visible_on_schedule === true
                                    ? "destructive"
                                    : "default"
                            }
                        >
                            {row.original.is_visible_on_schedule === undefined ||
                            row.original.is_visible_on_schedule === true ? (
                                <>
                                    <CalendarMinus className="stroke-destructive size-4" />
                                    Remover do calendário
                                </>
                            ) : (
                                <>
                                    <CalendarPlus className="stroke-primary-foreground size-4" />
                                    Adicionar ao calendário
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={async () => {
                                try {
                                    await row.original.handleRefreshInstanceData(row.original.id, row.original.uuid);
                                } catch (error) {
                                    console.error("Error refreshing instance:", error);
                                }
                            }}
                            className="cursor-pointer"
                            variant="default"
                        >
                            <RefreshCw className="size-4" />
                            Atualizar instância
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
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Reunião</p>
                    <Button
                        variant="ghost"
                        className="px-2 font-semibold text-left"
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
            <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
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
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Data & Hora</p>
                    <Button
                        variant="ghost"
                        className="px-2 font-semibold text-left"
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
            <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                <p className="font-medium">{format(new Date(row.original.start_time), "Pp", { locale: ptBR })}</p>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            const sortState = column.getIsSorted();
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Status</p>
                    <Button
                        variant="ghost"
                        className="px-2 font-semibold text-left"
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
            <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                <p className="font-medium">{`${row.original.status === "available" ? "Disponível" : "Deletada"}`}</p>
            </div>
        ),
    },
    {
        id: "duration",
        accessorFn: (row) => row.duration || 0,
        header: ({ column }) => {
            const sortState = column.getIsSorted();
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Duração</p>
                    <Button
                        variant="ghost"
                        className="px-2 font-semibold text-left"
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
                <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                    <p className="font-medium">{hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`}</p>
                </div>
            );
        },
    },
];

export default function ZoomRecurrenceMeetingPage({ currentMeeting }: { currentMeeting: ZoomMeeting }) {
    const [isRefreshingNewMeetingData, setIsRefreshingNewMeetingData] = useState<boolean>(false);
    const [isRefreshingAllMeetingData, setIsRefreshingAllMeetingData] = useState<boolean>(false);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [selectedInstancie, setSelectedInstancie] = useState<ZoomMeetingPastInstance | null>(null);

    const { accounts } = useZoomAccountStore();
    const { refreshAndAddOnlyNewPastInstances, refreshAndUpdateMeeting, deleteMeeting } = useZoomMeetingStore();
    const { pastInstances, updatePastInstanceById, refreshInstanceData } = useZoomMeetingPastInstanceStore();

    const handleRefreshNewMeetingData = async () => {
        setIsRefreshingNewMeetingData(true);

        try {
            if (!currentMeeting) throw new Error("Meeting not found");

            const account = accounts.find((account) => account.id === currentMeeting.account_id);
            if (!account) return;

            await refreshAndAddOnlyNewPastInstances(currentMeeting, account);
        } catch {
            toast.error("Erro ao atualizar a reunião!");
        } finally {
            setIsRefreshingNewMeetingData(false);
        }
    };

    const handleRefreshAllMeetingData = async () => {
        setIsRefreshingAllMeetingData(true);

        try {
            if (!currentMeeting) throw new Error("Meeting not found");

            const account = accounts.find((account) => account.id === currentMeeting.account_id);
            if (!account) return;

            await refreshAndUpdateMeeting(currentMeeting, account);
        } catch {
            toast.error("Erro ao atualizar a reunião!");
        } finally {
            setIsRefreshingAllMeetingData(false);
        }
    };

    const handleRefreshInstanceData = useMemo(
        () => async (instanceId: string, uuid: string) => {
            const account = accounts.find((account) => account.id === currentMeeting.account_id);
            if (!account) {
                toast.error("Conta não encontrada!");
                return;
            }

            await refreshInstanceData(instanceId, uuid, account);
        },
        [accounts, currentMeeting.account_id, refreshInstanceData],
    );

    const handleOpenDialog = useMemo(
        () => (instancieId: string) => {
            const instancie = pastInstances.find((p) => p.id === instancieId);
            if (!instancie) return toast.error("Instância não encontrada!");
            setSelectedInstancie(instancie);
            setIsDialogOpen(true);
        },
        [pastInstances],
    );

    const meetingOccurrences = useMemo(
        () =>
            currentMeeting?.occurrences?.filter(Boolean)?.map((occurrence) => ({
                ...occurrence,
                topic: currentMeeting.topic,
                meeting_id: currentMeeting.id,
            })),
        [currentMeeting],
    );

    const meetingPastInstances = useMemo(
        () =>
            pastInstances
                ?.filter(Boolean)
                .filter((p) => p.meeting_id === currentMeeting?.id)
                ?.map((pastInstance) => {
                    const participantGroups = new Map<string, ZoomMeetingParticipant>();

                    pastInstance?.participants?.forEach((participant: ZoomMeetingParticipant) => {
                        const existing = participantGroups.get(participant.user_email);
                        if (!existing) {
                            participantGroups.set(participant.user_email, participant);
                        }
                    });

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
        ],
    );

    const currentMeetingOccurrences = meetingOccurrences || [];
    const currentMeetingPastInstances = meetingPastInstances || [];

    return (
        <>
            <div className="flex flex-col gap-8 p-4 w-full h-full overflow-hidden">
                <header className="flex flex-col gap-6 w-full">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="flex gap-1 font-semibold text-muted-foreground">
                                Ultima sincronização em:
                                <p className="font-normal">
                                    {currentMeeting?.synchronized_at &&
                                        new Date(currentMeeting.synchronized_at || 0).toLocaleDateString("pt-BR")}
                                </p>
                            </p>
                            <p className="flex gap-1 font-semibold text-muted-foreground">
                                Host:
                                <p className="font-normal">{currentMeeting?.host_email}</p>
                            </p>
                        </div>
                        <ButtonGroup>
                            <Button
                                disabled={isRefreshingNewMeetingData}
                                onClick={handleRefreshNewMeetingData}
                                className="border font-semibold cursor-pointer"
                            >
                                <RotateCw className={cn("size-5", isRefreshingNewMeetingData && "animate-spin")} />
                                Buscar novos dados
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="border-l-0 rounded-l-none cursor-pointer">
                                        <ChevronDownIcon />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="[--radius:1rem]" autoFocus={false}>
                                    <DropdownMenuItem asChild>
                                        <Button
                                            variant="default"
                                            disabled={isRefreshingAllMeetingData}
                                            onClick={handleRefreshAllMeetingData}
                                            className="gap-4 h-max font-semibold cursor-pointer"
                                        >
                                            <RefreshCw className={cn("size-5", isRefreshingAllMeetingData && "animate-spin")} />
                                            <div className="flex flex-col items-start">
                                                <p>Atualizar todos os dados</p>

                                                <p className="font-normal text-xs">
                                                    Levará cerca de{" "}
                                                    <mark className="bg-transparent font-semibold">
                                                        {((currentMeetingPastInstances.length * 7300) / 60000).toFixed()}{" "}
                                                        minutos
                                                    </mark>
                                                </p>
                                            </div>
                                        </Button>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
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
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </ButtonGroup>
                    </div>

                    {meetingOccurrences &&
                        meetingOccurrences?.filter(
                            (m) => new Date(m.start_time).getTime() + m.duration * 60 * 1000 < Date.now(),
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
                                            (m) => new Date(m.start_time).getTime() + m.duration * 60 * 1000 < Date.now(),
                                        ).length
                                    }{" "}
                                    instancias desatualizadas, atualize (re-sincronize) os dados desta reunião.
                                </AlertDescription>
                            </Alert>
                        )}
                </header>

                {(currentMeetingOccurrences?.length || currentMeetingPastInstances?.length) && (
                    <Tabs
                        defaultValue={currentMeetingOccurrences.length ? "occurrences" : "pastInstancies"}
                        className="flex flex-col w-full h-full overflow-hidden"
                    >
                        <TabsList className="flex gap-2 w-max overflow-hidden">
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
                            <TabsContent value="occurrences" className="w-full h-full overflow-hidden">
                                <MeetingDataTable columns={meetingOccurrencesColumns} data={currentMeetingOccurrences} />
                            </TabsContent>
                        )}

                        {currentMeetingPastInstances && (
                            <TabsContent value="pastInstancies" className="w-full h-full overflow-hidden">
                                <MeetingDataTable columns={meetingPastInstancesColumns} data={currentMeetingPastInstances} />
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
