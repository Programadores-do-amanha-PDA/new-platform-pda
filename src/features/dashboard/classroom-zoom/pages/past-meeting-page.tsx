"use client";
import { useState } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { useZoomAccountStore } from "@/stores/modules/classrooms/zoom/accounts";
import { useZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeetingDataTable } from "../components/meetings/meeting/meeting-data-table";
import {
  ZoomMeetingParticipantT,
  ZoomMeetingPollResultsT,
} from "@/types/classroom-zoom/meetings";
import { cn } from "@/lib/utils";

const meetingPollResultsColumns: ColumnDef<ZoomMeetingPollResultsT>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Nome</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
        <p className="font-medium">{row.getValue("name")}</p>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Email</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
        <p className="font-medium">{row.getValue("email")}</p>
      </div>
    ),
  },
  {
    accessorKey: "content_answer",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Conteúdo</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
        <p className="font-medium">{row.getValue("content_answer")}</p>
      </div>
    ),
  },
  {
    accessorKey: "facilitation_answer",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Facilitação</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
        <p className="font-medium">{row.getValue("facilitation_answer")}</p>
      </div>
    ),
  },
  {
    accessorKey: "self_answer",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Auto-Avaliação</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
        <p className="font-medium">{row.getValue("self_answer")}</p>
      </div>
    ),
  },
];

const meetingParticipantsColumns: ColumnDef<
  ZoomMeetingParticipantT & { absence: number }
>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Nome</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
        <p className="font-medium">{row.getValue("name")}</p>
      </div>
    ),
  },
  {
    accessorKey: "user_email",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Email</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
        <p className="font-medium">{row.original.user_email}</p>
      </div>
    ),
  },
  {
    accessorKey: "duration",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Presença</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
        <p className="font-medium">
          {Math.floor(row.original.duration / 60) > 60
            ? `${Math.floor(row.original.duration / 60 / 60)} Horas`
            : `${Math.floor(row.original.duration / 60)} Minutos`}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "absence",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Ausência</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
        <p className="font-medium">
          {row.original.absence > 60
            ? `${Math.floor(row.original.absence / 60)} Horas`
            : `${row.original.absence} Minutos`}
        </p>
      </div>
    ),
  },
];

export default function ZoomPastMeetingPage({
  meeting_id,
}: {
  meeting_id: string;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const { accounts } = useZoomAccountStore();
  const { meetings, refreshAndUpdateMeeting } = useZoomMeetingStore();

  const currentMeeting = meetings?.find((m) => m.id === meeting_id);

  const handleRefreshMeeting = async () => {
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

  if (!currentMeeting || !currentMeeting.participants) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        Carregando...
      </div>
    );
  }

  const participantGroups = new Map<
    string,
    (typeof currentMeeting.participants)[number]
  >();
  currentMeeting?.participants?.forEach((participant) => {
    const existing = participantGroups.get(participant.name);
    if (existing) {
      existing.duration += participant.duration;
    } else {
      participantGroups.set(participant.name, {
        ...participant,
        duration: participant.duration,
      });
    }
  });

  const participantsData = Array.from(participantGroups.values()).map((p) => ({
    ...p,
    absence:
      currentMeeting?.duration &&
      Math.round(currentMeeting.duration - Math.floor(p.duration / 60)) > 0
        ? Math.round(currentMeeting.duration - Math.floor(p.duration / 60))
        : 0,
  }));

  return (
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
            <p className="text-muted-foreground flex gap-1 font-semibold">
              Duração:
              <p className="font-normal">
                {currentMeeting?.duration > 60
                  ? `${Math.floor(currentMeeting.duration / 60)} Horas`
                  : `${currentMeeting.duration} Minutos`}
              </p>
            </p>
          </div>
          <Button
            disabled={isUpdating}
            onClick={handleRefreshMeeting}
            title="Atualizar"
            className="font-semibold"
          >
            <RefreshCw className={cn("size-5", isUpdating && "animate-spin")} />
            Atualizar
          </Button>
        </div>
      </header>

      {(currentMeeting?.participants?.length ||
        currentMeeting?.poll_results?.length) && (
        <Tabs
          defaultValue="upcoming"
          className="w-full h-full flex flex-col overflow-hidden"
        >
          <TabsList className="w-max flex gap-2 overflow-hidden">
            {currentMeeting.participants &&
              currentMeeting.participants?.length > 0 && (
                <TabsTrigger value="upcoming">
                  Participantes ({currentMeeting.participants.length})
                </TabsTrigger>
              )}

            {currentMeeting.poll_results &&
              currentMeeting.poll_results.length > 0 && (
                <TabsTrigger value="completed">
                  Respostas ({currentMeeting.poll_results.length})
                </TabsTrigger>
              )}
          </TabsList>

          {currentMeeting.participants?.length && (
            <TabsContent
              value="upcoming"
              className="w-full h-full overflow-hidden"
            >
              <MeetingDataTable
                columns={meetingParticipantsColumns}
                data={participantsData}
              />
            </TabsContent>
          )}

          {currentMeeting.poll_results && (
            <TabsContent
              value="completed"
              className="w-full h-full overflow-hidden"
            >
              <MeetingDataTable
                columns={meetingPollResultsColumns}
                data={currentMeeting.poll_results}
              />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
