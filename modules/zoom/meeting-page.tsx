"use client";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStackContext } from "@/context/admin/stack-context";
import {
  ZoomMeetingParticipantType,
  ZoomMeetingPollResults,
} from "@/types/zoom/meetings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MeetingDataTable } from "@/components/classrooms/zoom/meetings/meeting/meeting-data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, RefreshCw, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

type MeetingOccurrence = {
  topic: string;
  meeting_id: string;
  occurrence_id: string;
  start_time: string;
  duration: number;
  status?: string;
  is_visible_on_schedule: boolean;
  actions?: string;
};

type ValidMeetingKeys = Exclude<keyof MeetingOccurrence, "actions">;
type Column = {
  accessorKey: ValidMeetingKeys;
  header: string;
  cell?: ({ row }: { row: { original: MeetingOccurrence } }) => React.ReactNode;
};

type MeetingPastInstance = {
  topic: string;
  meeting_id: string;
  uuid: string;
  start_time: string;
  duration: number;
  id: number;
  poll_results?: ZoomMeetingPollResults[];
  participants?: ZoomMeetingParticipantType[];
  is_visible_on_schedule?: boolean;
};

const ZoomMeetingPage = ({ meeting_id }: { meeting_id: string }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    classroomsStack: {
      zoom: {
        accounts: { accounts },
        meetings: { meetings, handleRefreshAndUpdateZoomMeeting },
      },
    },
  } = useAdminStackContext();

  const currentMeeting = meetings?.find((m) => m._id === meeting_id);

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
      meetingOccurrences: currentMeeting?.occurrences?.map((occurrence) => ({
        ...occurrence,
        topic: currentMeeting.topic,
        meeting_id: currentMeeting._id,
      })),
      meetingPastInstances: currentMeeting?.past_instances?.map(
        (pastInstance) => ({
          ...pastInstance,
          topic: currentMeeting.topic,
          duration: currentMeeting.duration,
          meeting_id: currentMeeting._id,
        })
      ),
    };
  }, [meetings, meeting_id]);

  const meetingOccurrencesColumns: Column[] = [
    {
      accessorKey: "topic",
      header: "Reunião",
    },
    {
      accessorKey: "start_time",
      header: "Data/Hora",
      cell: ({ row }: { row: { original: MeetingOccurrence } }) =>
        format(new Date(row.original.start_time), "Pp", { locale: ptBR }),
    },
    {
      accessorKey: "duration",
      header: "Duração",
      cell: ({ row }: { row: { original: MeetingOccurrence } }) =>
        `${row.original.duration} minutos`,
    },
    {
      accessorKey: "is_visible_on_schedule",
      header: "Ações",
      cell: ({ row }: { row: { original: MeetingOccurrence } }) =>
        !isUpdating && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="!p-0">
                <Button variant="ghost">Ocultar do calendário</Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
    },
  ];

  const meetingPastInstancesColumns: ColumnDef<MeetingPastInstance>[] = [
    {
      accessorKey: "topic",
      header: "Reunião",
    },
    {
      accessorKey: "start_time",
      header: "Data",
      cell: ({ row }) =>
        format(new Date(row.original.start_time!), "dd/MM/yyyy", {
          locale: ptBR,
        }),
    },
    {
      accessorKey: "duration",
      header: "Duração",
      cell: ({ row }) => `${row.getValue("duration")} min`,
    },
    {
      accessorKey: "participants",
      header: "Participantes",
      cell: ({ row }) => row.original.participants?.length || 0,
    },
    {
      accessorKey: "poll_results",
      header: "Respostas",
      cell: ({ row }) => row.original.poll_results?.length || 0,
    },
  ];

  function renderCellValue(value: unknown): React.ReactNode {
    if (Array.isArray(value)) {
      return value.length;
    }

    if (typeof value === "object" && value !== null) {
      const jsonString = JSON.stringify(value);
      return jsonString ? jsonString : null;
    }

    switch (typeof value) {
      case "string":
        return value;
      case "number":
        return value;
      case "boolean":
        return value ? "Sim" : "Não";
      case "undefined":
        return "";
      default:
        return String(value);
    }
  }

  return (
    <div className="w-full h-full p-4 overflow-hidden flex flex-col gap-8">
      <header className="w-full flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-bold text-2xl text-foreground">
              {currentMeeting?.topic}
            </h2>
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
            (m) => new Date(m.start_time).getTime() < Date.now()
          )?.length > 0 && (
            <Alert variant={"destructive"}>
              <Siren className="size-4" />
              <AlertTitle className="font-semibold">
                Foi encontrado dados desatualizados!
              </AlertTitle>
              <AlertDescription>
                Foram encontrados{" "}
                {
                  meetingOccurrences?.filter(
                    (m) => new Date(m.start_time).getTime() < Date.now()
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
                Futuras ({meetingOccurrences.length})
              </TabsTrigger>
            )}

            {meetingPastInstances && meetingPastInstances.length > 0 && (
              <TabsTrigger value="completed">
                Terminadas ({meetingPastInstances.length})
              </TabsTrigger>
            )}
          </TabsList>

          {meetingOccurrences?.length && (
            <TabsContent
              value="upcoming"
              className="w-full h-full overflow-hidden"
            >
              <div className="w-full max-h-[70vh] h-full flex overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    {meetingOccurrencesColumns.map((column) => (
                      <TableHead key={column.accessorKey}>
                        {column.header}
                      </TableHead>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {meetingOccurrences
                      ?.filter(
                        (m) => new Date(m.start_time).getTime() > Date.now()
                      )
                      .map((meeting) => {
                        if (!meeting) return null;
                        return (
                          <TableRow
                            key={meeting.occurrence_id}
                            data-meeting-id={meeting.occurrence_id}
                            className={cn(
                              new Date(meeting.start_time).getTime() <
                                Date.now() && "bg-red-100 hover:bg-red-100"
                            )}
                          >
                            {meetingOccurrencesColumns.map((column) => (
                              <TableCell
                                key={`${meeting.occurrence_id}-${column.accessorKey}`}
                              >
                                {column.cell
                                  ? column.cell({ row: { original: meeting } })
                                  : renderCellValue(
                                      meeting[column.accessorKey]
                                    )}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
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
