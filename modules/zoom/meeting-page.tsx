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
import { CalendarMinus, CalendarPlus, RefreshCw, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import RefreshButton from "@/components/common/refresh-button";

type MeetingOccurrence = ZoomMeetingOccurrenceType & {
  topic: string;
  meeting_id: string;
  actions?: string;
  handleUpdateOccurrence: (occurrence: MeetingOccurrence) => Promise<void>;
};

type MeetingPastInstance = ZoomMeetingPastInstancesType & {
  topic: string;
  meeting_id: string;
  duration: number;
  handleUpdatePastInstance: (
    pastInstance: MeetingPastInstance
  ) => Promise<void>;
};

const meetingPastInstancesColumns: ColumnDef<MeetingPastInstance>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
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
  {
    id: "actions",
    header: "Calendário",
    cell: ({ row }: { row: { original: MeetingPastInstance } }) => (
      <div key={row.original.uuid}>
        <RefreshButton
          handleClick={() =>
            row.original.handleUpdatePastInstance(row.original)
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
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: { original: MeetingOccurrence } }) =>
      `${row.original.status === "available" ? "Disponível" : "Deletada"}`,
  },
  {
    accessorKey: "duration",
    header: "Duração",
    cell: ({ row }: { row: { original: MeetingOccurrence } }) =>
      `${row.original.duration} minutos`,
  },
  {
    accessorKey: "is_visible_on_schedule",
    header: "Calendário",
    cell: ({ row }: { row: { original: MeetingOccurrence } }) => (
      <RefreshButton
        variant={
          row.original.is_visible_on_schedule === undefined ||
          row.original.is_visible_on_schedule === true
            ? "destructive"
            : "default"
        }
        size="icon"
        handleClick={() => row.original.handleUpdateOccurrence(row.original)}
      >
        {row.original.is_visible_on_schedule === undefined ||
        row.original.is_visible_on_schedule === true ? (
          <CalendarMinus className="size-4" />
        ) : (
          <CalendarPlus className="size-4" />
        )}
      </RefreshButton>
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
          handleUpdateZoomMeetingOccurrence,
          handleUpdateZoomMeetingPastInstance,
        },
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

  const handleUpdateOccurrence = async (occurrence: MeetingOccurrence) => {
    try {
      const currentMeeting = meetings?.find(
        (m) => m._id === occurrence.meeting_id
      );
      if (!currentMeeting) throw new Error("Meeting not found");

      await handleUpdateZoomMeetingOccurrence(
        currentMeeting.id,
        occurrence.occurrence_id,
        {
          is_visible_on_schedule: !occurrence.is_visible_on_schedule,
        }
      );
    } catch {
      toast.error("Erro ao atualizar a reunião!");
    }
  };

  const handleUpdatePastInstance = async (
    pastInstance: MeetingPastInstance
  ) => {
    try {
      const currentMeeting = meetings?.find(
        (m) => m._id === pastInstance.meeting_id
      );

      if (!currentMeeting) throw new Error("Meeting not found");

      await handleUpdateZoomMeetingPastInstance(
        currentMeeting.id,
        pastInstance.uuid,
        {
          is_visible_on_schedule: !pastInstance.is_visible_on_schedule,
        }
      );
    } catch {
      toast.error("Erro ao atualizar a reunião!");
    }
  };

  // Processamento das meetings
  const { meetingOccurrences, meetingPastInstances } = useMemo(() => {
    return {
      meetingOccurrences: currentMeeting?.occurrences
        ?.map((occurrence) => ({
          ...occurrence,
          topic: currentMeeting.topic,
          meeting_id: currentMeeting._id,
          handleUpdateOccurrence: handleUpdateOccurrence,
        }))
        .sort(
          (a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        ),
      meetingPastInstances: currentMeeting?.past_instances
        ?.map((pastInstance) => ({
          ...pastInstance,
          topic: currentMeeting.topic,
          duration: currentMeeting.duration,
          meeting_id: currentMeeting._id,
          handleUpdatePastInstance: handleUpdatePastInstance,
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
