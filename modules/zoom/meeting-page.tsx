"use client";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStackContext } from "@/context/admin/stack-context";
import {
  ZoomMeetingOccurrenceType,
  ZoomMeetingPastInstancesType,
} from "@/types/zoom/meetings";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MeetingDataTable } from "@/components/common/classrooms/zoom/meetings/meeting/meeting-data-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarMinus,
  CalendarPlus,
  RefreshCw,
  Siren,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import RefreshButton from "@/components/common/refresh-button";

type MeetingOccurrence = ZoomMeetingOccurrenceType & {
  topic: string | undefined;
  meeting_id: string | null;
};

type MeetingPastInstance = ZoomMeetingPastInstancesType & {
  topic: string | undefined;
  meeting_id: string | null;
  duration: number | undefined;
  handleUpdateZoomPastInstance: (
    id: string,
    updates: Partial<ZoomMeetingPastInstancesType>
  ) => Promise<boolean>;
};

const meetingPastInstancesColumns: ColumnDef<MeetingPastInstance>[] = [
  {
    accessorKey: "topic",
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
            Reunião
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
        {row.getValue("topic")}
      </div>
    ),
  },
  {
    accessorKey: "start_time",
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
            Data
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
        {format(new Date(row.original.start_time!), "dd/MM/yyyy", {
          locale: ptBR,
        })}
      </div>
    ),
  },
  {
    accessorKey: "duration",
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
            Duração
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
        {row.getValue("duration")} Minutos
      </div>
    ),
  },
  {
    accessorKey: "participants",
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
            Participantes
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
        {row.original.participants?.length || 0}
      </div>
    ),
  },
  {
    accessorKey: "poll_results",
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
            Respostas
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
        {row.original.poll_results?.length || 0}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => {
      return (
        <div className="w-full truncate h-full flex justify-center items-center px-2">
          <Button variant="ghost" className="text-left px-2 font-semibold">
            Calendário
          </Button>
        </div>
      );
    },
    cell: ({ row }: { row: { original: MeetingPastInstance } }) => (
      <div
        key={row.original.uuid}
        className="w-full h-full truncate flex justify-center items-center"
      >
        <RefreshButton
          handleClick={async () =>
            void row.original.handleUpdateZoomPastInstance(row.original.id, {
              is_visible_on_schedule: !row.original.is_visible_on_schedule,
            })
          }
          variant={
            row.original.is_visible_on_schedule === undefined ||
            row.original.is_visible_on_schedule === true
              ? "destructive"
              : "default"
          }
          size="icon"
        >
          {row.original.is_visible_on_schedule === undefined ||
          row.original.is_visible_on_schedule === true ? (
            <CalendarMinus className="size-4" />
          ) : (
            <CalendarPlus className="size-4" />
          )}
        </RefreshButton>
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
            Reunião
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
        {row.getValue("topic")}
      </div>
    ),
  },
  {
    accessorKey: "start_time",
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
            Data & Hora
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
    cell: ({ row }: { row: { original: MeetingOccurrence } }) => (
      <div className="w-full h-full max-w-sm truncate flex flex-row gap-2 justify-start items-center p-2 border-r">
        {format(new Date(row.original.start_time), "Pp", { locale: ptBR })}
      </div>
    ),
  },
  {
    accessorKey: "status",
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
            Status
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
    cell: ({ row }: { row: { original: MeetingOccurrence } }) => (
      <div className="w-full h-full max-w-sm truncate flex flex-row gap-2 justify-start items-center p-2 border-r">
        {`${row.original.status === "available" ? "Disponível" : "Deletada"}`}
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
            Duração
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
    cell: ({ row }: { row: { original: MeetingOccurrence } }) => (
      <div className="w-full h-full max-w-sm truncate flex flex-row gap-2 justify-start items-center p-2 border-r">{`${row.original.duration} minutos`}</div>
    ),
  },
];

const ZoomMeetingPage = ({ meeting_id }: { meeting_id: string }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    classroomsStack: {
      zoom: {
        accounts: { accounts },
        meetings: {
          meetings,
          handleRefreshAndUpdateZoomMeeting,
          pastInstances: { pastInstances, handleUpdateZoomPastInstance },
        },
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

  // Processamento das meetings
  const { meetingOccurrences, meetingPastInstances } = useMemo(() => {
    return {
      meetingOccurrences: currentMeeting?.occurrences
        ?.map((occurrence) => ({
          ...occurrence,
          topic: currentMeeting.topic,
          meeting_id: currentMeeting.id,
        }))
        .sort(
          (a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        ),
      meetingPastInstances: pastInstances
        .filter((p) => p.meeting_id === currentMeeting?.id)
        ?.map((pastInstance) => ({
          ...pastInstance,
          topic: currentMeeting?.topic,
          duration: currentMeeting?.duration,
          handleUpdateZoomPastInstance,
        }))
        .sort(
          (a, b) =>
            new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        ),
    };
  }, [currentMeeting]);

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

      {(meetingOccurrences?.length || meetingPastInstances?.length) && (
        <Tabs
          defaultValue="upcoming"
          className="w-full h-full flex flex-col overflow-hidden"
        >
          <TabsList className="w-max flex gap-2 overflow-hidden">
            {meetingOccurrences && meetingOccurrences?.length > 0 && (
              <TabsTrigger value="upcoming">
                Reuniões Futuras ({meetingOccurrences.length})
              </TabsTrigger>
            )}

            {meetingPastInstances && meetingPastInstances.length > 0 && (
              <TabsTrigger value="completed">
                Reuniões Terminadas ({meetingPastInstances.length})
              </TabsTrigger>
            )}
          </TabsList>

          {meetingOccurrences?.length && (
            <TabsContent
              value="upcoming"
              className="w-full h-full overflow-hidden"
            >
              <MeetingDataTable
                columns={meetingOccurrencesColumns}
                data={meetingOccurrences}
              />
            </TabsContent>
          )}

          {meetingPastInstances && (
            <TabsContent
              value="completed"
              className="w-full h-full bg-red-400 overflow-hidden"
            >
              <MeetingDataTable
                columns={meetingPastInstancesColumns}
                data={meetingPastInstances}
              />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
};

export default ZoomMeetingPage;
