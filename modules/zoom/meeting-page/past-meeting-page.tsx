"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStackContext } from "@/context/admin/stack-context";
import {
  ZoomMeetingParticipantType,
  ZoomMeetingPollResultQuestionDetails,
} from "@/types/zoom/meetings";
import { ColumnDef } from "@tanstack/react-table";
import { MeetingDataTable } from "@/components/common/classrooms/zoom/meetings/meeting/meeting-data-table";
import { ArrowDown, ArrowUp, ArrowUpDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatSecondsToTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [
    hours > 0 ? hours : 0,
    minutes.toString().padStart(2, "0"),
    remainingSeconds.toString().padStart(2, "0"),
  ].join(":");
}

const meetingPollResultsColumns: ColumnDef<ZoomMeetingPollResultQuestionDetails>[] =
  [
    {
      accessorKey: "name",
      header: ({ column }) => {
        const sortState = column.getIsSorted();
        return (
          <div className="w-full truncate h-full flex justify-start items-center border-r px-2">
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
              Nome
              {sortState === "asc" ? (
                <ArrowUp className="stroke-primary" />
              ) : sortState === "desc" ? (
                <ArrowDown className="stroke-primary" />
              ) : (
                <ArrowUpDown />
              )}
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-full h-full truncate flex flex-row gap-2 justify-start items-center p-2 border-r">
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        const sortState = column.getIsSorted();
        return (
          <div className="w-full truncate h-full flex justify-start items-center border-r px-2">
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
              Email
              {sortState === "asc" ? (
                <ArrowUp className="stroke-primary" />
              ) : sortState === "desc" ? (
                <ArrowDown className="stroke-primary" />
              ) : (
                <ArrowUpDown />
              )}
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-full h-full truncate flex flex-row gap-2 justify-start items-center p-2 border-r">
          {row.getValue("email")}
        </div>
      ),
    },
    {
      accessorKey: "content_answer",
      header: ({ column }) => {
        const sortState = column.getIsSorted();
        return (
          <div className="w-full truncate h-full flex justify-start items-center border-r px-2">
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
              Conteúdo
              {sortState === "asc" ? (
                <ArrowUp className="stroke-primary" />
              ) : sortState === "desc" ? (
                <ArrowDown className="stroke-primary" />
              ) : (
                <ArrowUpDown />
              )}
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-full h-full truncate flex flex-row gap-2 justify-start items-center p-2 border-r">
          {row.getValue("content_answer")}
        </div>
      ),
    },
    {
      accessorKey: "facilitation_answer",
      header: ({ column }) => {
        const sortState = column.getIsSorted();
        return (
          <div className="w-full truncate h-full flex justify-start items-center border-r px-2">
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
              Facilitação
              {sortState === "asc" ? (
                <ArrowUp className="stroke-primary" />
              ) : sortState === "desc" ? (
                <ArrowDown className="stroke-primary" />
              ) : (
                <ArrowUpDown />
              )}
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-full h-full truncate flex flex-row gap-2 justify-start items-center p-2 border-r">
          {row.getValue("facilitation_answer")}
        </div>
      ),
    },
    {
      accessorKey: "self_answer",
      header: ({ column }) => {
        const sortState = column.getIsSorted();
        return (
          <div className="w-full truncate h-full flex justify-start items-center border-r px-2">
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
              Auto-Avaliação
              {sortState === "asc" ? (
                <ArrowUp className="stroke-primary" />
              ) : sortState === "desc" ? (
                <ArrowDown className="stroke-primary" />
              ) : (
                <ArrowUpDown />
              )}
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-full h-full truncate flex flex-row gap-2 justify-start items-center p-2 border-r">
          {row.getValue("self_answer")}
        </div>
      ),
    },
  ];

const meetingParticipantsColumns: ColumnDef<
  ZoomMeetingParticipantType & { absence: number }
>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full truncate h-full flex justify-start items-center border-r px-2">
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
            Nome
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary" />
            ) : (
              <ArrowUpDown />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full truncate flex flex-row gap-2 justify-start items-center p-2 border-r">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "user_email",
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full truncate h-full flex justify-start items-center border-r px-2">
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
            Email
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary" />
            ) : (
              <ArrowUpDown />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full truncate flex flex-row gap-2 justify-start items-center p-2 border-r">
        {row.original.user_email}
      </div>
    ),
  },
  {
    accessorKey: "duration",
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full max-w-sm truncate h-full flex justify-start items-center border-r px-2">
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
            Presença
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary" />
            ) : (
              <ArrowUpDown />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full max-w-sm truncate flex flex-row gap-2 justify-start items-center p-2 border-r">
        {formatSecondsToTime(row.original.duration)}
      </div>
    ),
  },
  {
    accessorKey: "absence",
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full max-w-sm truncate h-full flex justify-start items-center border-r px-2">
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
            Ausência
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary" />
            ) : (
              <ArrowUpDown />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full max-w-sm truncate flex flex-row gap-2 justify-start items-center p-2 border-r">
        {formatSecondsToTime(row.original.absence)}
      </div>
    ),
  },
];

const ZoomPastMeetingPage = ({ meeting_id }: { meeting_id: string }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    classroomsStack: {
      zoom: {
        accounts: { accounts },
        meetings: { meetings, handleRefreshAndUpdateZoomMeeting },
      },
    },
  } = useAdminStackContext();

  const currentMeeting = meetings?.find((m) => m.id === meeting_id);

  const handleRefreshMeeting = async () => {
    setIsUpdating(true);

    try {
      if (!currentMeeting) throw new Error("Meeting not found");

      const account = accounts.find(
        (account) => account.id === currentMeeting.account_id
      );
      if (!account) return;

      await handleRefreshAndUpdateZoomMeeting(currentMeeting.id, account);

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
      currentMeeting?.duration && currentMeeting.duration * 60 - p.duration > 0
        ? currentMeeting.duration * 60 - p.duration
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
                {formatSecondsToTime(currentMeeting?.duration * 60)}
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
              className="w-full h-full bg-red-400 overflow-hidden"
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
};

export default ZoomPastMeetingPage;
