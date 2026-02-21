"use client";

import { useState } from "react";
import { sileo } from "sileo";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDownIcon, FolderX, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { MeetingDataTable } from "../components/meetings/meeting/meeting-data-table";
import { DeleteConfirmationButton } from "@/components/shared/delete-confirmation-dialog";
import EmptyState from "@/components/shared/empty-states/empty-state";
import { ButtonGroup } from "@/components/ui/button-group";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useZoomAccountStore } from "../stores/accounts";
import { useZoomMeetingStore } from "../stores/meetings";
import { ZoomMeetingPollResultsT, ZoomMeetingParticipant, ZoomMeeting } from "../types/meetings";

const meetingPollResultsColumns: ColumnDef<ZoomMeetingPollResultsT>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Nome</p>
                    <Button variant="ghost" size="icon" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        <ArrowUpDown />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => (
            <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                <p className="font-medium">{row.getValue("name")}</p>
            </div>
        ),
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Email</p>
                    <Button variant="ghost" size="icon" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        <ArrowUpDown />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => (
            <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                <p className="font-medium">{row.getValue("email")}</p>
            </div>
        ),
    },
    {
        accessorKey: "content_answer",
        header: ({ column }) => {
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Conteúdo</p>
                    <Button variant="ghost" size="icon" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        <ArrowUpDown />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => (
            <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                <p className="font-medium">{row.getValue("content_answer")}</p>
            </div>
        ),
    },
    {
        accessorKey: "facilitation_answer",
        header: ({ column }) => {
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Facilitação</p>
                    <Button variant="ghost" size="icon" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        <ArrowUpDown />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => (
            <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                <p className="font-medium">{row.getValue("facilitation_answer")}</p>
            </div>
        ),
    },
    {
        accessorKey: "self_answer",
        header: ({ column }) => {
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Auto-Avaliação</p>
                    <Button variant="ghost" size="icon" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        <ArrowUpDown />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => (
            <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                <p className="font-medium">{row.getValue("self_answer")}</p>
            </div>
        ),
    },
];

const meetingParticipantsColumns: ColumnDef<ZoomMeetingParticipant & { absence: number }>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Nome</p>
                    <Button variant="ghost" size="icon" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        <ArrowUpDown />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => (
            <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                <p className="font-medium">{row.getValue("name")}</p>
            </div>
        ),
    },
    {
        accessorKey: "user_email",
        header: ({ column }) => {
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Email</p>
                    <Button variant="ghost" size="icon" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        <ArrowUpDown />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => (
            <div className="flex justify-start items-center p-2 border-r border-b w-full h-full min-h-[37px]">
                <p className="font-medium">{row.original.user_email}</p>
            </div>
        ),
    },
    {
        accessorKey: "duration",
        header: ({ column }) => {
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Presença</p>
                    <Button variant="ghost" size="icon" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        <ArrowUpDown />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => {
            const durationMinutes = Math.floor(row.original.duration / 60);
            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;

            return (
                <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                    <p className="font-medium">{hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`}</p>
                </div>
            );
        },
    },
    {
        accessorKey: "absence",
        header: ({ column }) => {
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Ausência</p>
                    <Button variant="ghost" size="icon" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        <ArrowUpDown />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => {
            const absenceMinutes = row.original.absence;
            const hours = Math.floor(absenceMinutes / 60);
            const minutes = absenceMinutes % 60;

            return (
                <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                    <p className="font-medium">{hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`}</p>
                </div>
            );
        },
    },
];

export default function ZoomPastMeetingPage({ currentMeeting }: { currentMeeting: ZoomMeeting }) {
    const [isUpdating, setIsUpdating] = useState(false);

    const { accounts } = useZoomAccountStore();
    const { refreshAndUpdateMeeting, deleteMeeting } = useZoomMeetingStore();

    const handleRefreshMeeting = async () => {
        setIsUpdating(true);

        try {
            if (!currentMeeting) throw new Error("Meeting not found");

            const account = accounts.find((account) => account.id === currentMeeting.account_id);
            if (!account) return;

            await refreshAndUpdateMeeting(currentMeeting, account);

            setIsUpdating(false);
        } catch {
            sileo.error({
                title: "Erro ao atualizar a reunião",
                description: "Ocorreu um erro ao atualizar a reunião. Tente novamente mais tarde.",
            });
            setIsUpdating(false);
        }
    };

    const currentPollResults = currentMeeting.poll_results || [];
    const currentParticipants = currentMeeting.participants || [];

    // Helper function to calculate duration from join_time and leave_time
    const calculateDurationFromTimes = (joinTime: string, leaveTime: string): number => {
        try {
            const joinDate = new Date(joinTime);
            const leaveDate = new Date(leaveTime);

            // Return duration in seconds
            return Math.max(0, Math.floor((leaveDate.getTime() - joinDate.getTime()) / 1000));
        } catch (error) {
            console.error("Error calculating duration from times:", error);
            return 0;
        }
    };

    const participantGroups = new Map<string, (typeof currentParticipants)[number] & { calculatedDuration: number }>();

    currentParticipants.forEach((participant) => {
        const existing = participantGroups.get(participant.user_email);

        // Calculate duration from join_time and leave_time
        const calculatedDuration = calculateDurationFromTimes(participant.join_time, participant.leave_time);

        if (existing) {
            existing.calculatedDuration += calculatedDuration;
        } else {
            participantGroups.set(participant.user_email, {
                ...participant,
                calculatedDuration,
            });
        }
    });

    const participantsData = Array.from(participantGroups.values()).map((p) => {
        // Convert calculated duration from seconds to minutes
        const participantDurationMinutes = Math.floor(p.calculatedDuration / 60);

        // Calculate absence in minutes (meeting duration is already in minutes)
        const absenceMinutes = currentMeeting?.duration ? Math.max(0, currentMeeting.duration - participantDurationMinutes) : 0;

        return {
            ...p,
            duration: p.calculatedDuration, // Use calculated duration instead of original
            absence: absenceMinutes,
        };
    });

    return (
        <div className="flex flex-col gap-8 p-4 w-full h-full overflow-hidden">
            <header className="flex justify-between items-center gap-4 w-full">
                <div className="flex flex-col items-start">
                    <p className="flex gap-1 font-semibold text-muted-foreground">
                        Ultima sincronização em:
                        <p className="font-normal">
                            {currentMeeting?.synchronized_at &&
                                new Date(currentMeeting.synchronized_at || 0).toLocaleDateString("pt-BR")}
                        </p>
                    </p>
                    {currentMeeting?.host_email && (
                        <p className="flex gap-1 font-semibold text-muted-foreground">
                            Host:
                            <p className="font-normal">{currentMeeting.host_email}</p>
                        </p>
                    )}

                    <p className="flex gap-1 font-semibold text-muted-foreground">
                        Duração:
                        <p className="font-normal">
                            {currentMeeting?.duration && currentMeeting.duration > 60
                                ? `${Math.floor(currentMeeting.duration / 60)}h ${currentMeeting.duration % 60}min`
                                : `${currentMeeting?.duration || 0} min`}
                        </p>
                    </p>
                </div>
                <div className="flex gap-4">
                    <ButtonGroup>
                        <Button
                            variant="default"
                            disabled={isUpdating}
                            onClick={handleRefreshMeeting}
                            title="Atualizar"
                            className="border font-semibold"
                        >
                            <RefreshCw className={cn("size-5", isUpdating && "animate-spin")} />
                            Atualizar dados
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" type="submit" className="border-l-0 rounded-l-none">
                                    <ChevronDownIcon />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="[--radius:1rem]">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <DeleteConfirmationButton
                                            onConfirm={() => deleteMeeting(currentMeeting.id)}
                                            buttonText="Deletar Reunião"
                                            dialogTitle="Deletar Reunião"
                                            description={`Tem certeza que deseja deletar a reunião "${currentMeeting.topic}"? Esta ação não pode ser desfeita e todas as presenças e entregas (polls) associadas serão permanentemente removidas.`}
                                            confirmText="Deletar Reunião"
                                        />
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </ButtonGroup>
                </div>
            </header>

            {participantsData.length > 0 || currentPollResults.length > 0 ? (
                <Tabs
                    defaultValue={participantsData.length > 0 ? "upcoming" : "completed"}
                    className="flex flex-col w-full h-full overflow-hidden"
                >
                    <TabsList className="flex gap-2 w-max overflow-hidden">
                        {participantsData.length > 0 && (
                            <TabsTrigger value="upcoming">Participantes ({participantsData.length})</TabsTrigger>
                        )}

                        {currentPollResults && currentPollResults.length > 0 && (
                            <TabsTrigger value="completed">Respostas ({currentPollResults.length})</TabsTrigger>
                        )}
                    </TabsList>

                    {participantsData.length && participantsData.length > 0 && (
                        <TabsContent value="upcoming" className="w-full h-full overflow-hidden">
                            <MeetingDataTable columns={meetingParticipantsColumns} data={participantsData} />
                        </TabsContent>
                    )}

                    {currentPollResults.length > 0 && (
                        <TabsContent value="completed" className="w-full h-full overflow-hidden">
                            <MeetingDataTable columns={meetingPollResultsColumns} data={currentPollResults} />
                        </TabsContent>
                    )}
                </Tabs>
            ) : (
                <EmptyState
                    icon={<FolderX />}
                    title="Nenhum participantes ou respostas"
                    description="Tente atualizar os dados da reunião para pegar os novos dados vindo da API do Zoom!"
                    action={
                        <Button
                            disabled={isUpdating}
                            onClick={handleRefreshMeeting}
                            title="Atualizar"
                            className="font-semibold"
                        >
                            <RefreshCw className={cn("size-5", isUpdating && "animate-spin")} />
                            Atualizar os dados da reunião
                        </Button>
                    }
                />
            )}
        </div>
    );
}
