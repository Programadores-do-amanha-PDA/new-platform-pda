"use client";
import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { ZoomMeetingType } from "@/types/zoom/meetings";
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

const ZoomMeetingPage = ({ meeting_id }: { meeting_id: string }) => {
  const {
    classroomsStack: {
      zoom: {
        meetings: { meetings },
      },
    },
  } = useAdminStackContext();

  // Processamento das meetings
  const { upcomingMeetings, completedMeetings } = useMemo(() => {
    const allMeetings = meetings
      .filter((m) => m._id === meeting_id)
      .flatMap((meeting) => [
        ...(meeting.occurrences?.map((occurrence) => ({
          ...meeting,
          id: Number(occurrence.occurrence_id),
          start_time: occurrence.start_time,
          status: "upcoming",
        })) || []),
        ...(meeting.past_instances?.map((instance) => ({
          ...meeting,
          uuid: instance.uuid,
          start_time: instance.start_time,
          status: "completed",
          participants: instance.participants,
          poll_results: instance.poll_results,
        })) || []),
      ]);

    const now = Date.now();

    return {
      upcomingMeetings: allMeetings.filter(
        (m) => new Date(m.start_time!).getTime() > now
      ),
      completedMeetings: allMeetings.filter(
        (m) => new Date(m.start_time!).getTime() <= now
      ),
    };
  }, [meetings, meeting_id]);

  // Colunas para meetings futuras (Table)
  const upcomingColumns = [
    {
      accessorKey: "topic",
      header: "Reunião",
    },
    {
      accessorKey: "start_time",
      header: "Data/Hora",
      cell: ({ row }: { row: { original: { start_time: string | Date } } }) =>
        format(new Date(row.original.start_time), "Pp", { locale: ptBR }),
    },
    {
      accessorKey: "duration",
      header: "Duração",
      cell: ({ row }: { row: { original: { duration: number } } }) =>
        `${row.original.duration} minutos`,
    },
    {
      accessorKey: "host_email",
      header: "Host",
    },
  ];

  // Colunas para meetings terminadas (DataTable)
  const completedColumns: ColumnDef<ZoomMeetingType>[] = [
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
    <div className="w-full h-full p-4 overflow-hidden">
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Futuras ({upcomingMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Terminadas ({completedMeetings.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Meetings Futuras */}
        <TabsContent
          value="upcoming"
          className="flex w-full h-full overflow-hidden"
        >
          <div className="w-full max-h-[80vh] h-full flex overflow-y-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  {upcomingColumns.map((column) => (
                    <TableHead key={column.accessorKey}>
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingMeetings.map((meeting) => (
                  <TableRow key={meeting.id} data-meeting-id={meeting.id}>
                    {upcomingColumns.map((column) => (
                      <TableCell key={`${meeting.id}-${column.accessorKey}`}>
                        {column.cell
                          ? column.cell({ row: { original: meeting } })
                          : renderCellValue(
                              meeting[
                                column.accessorKey as keyof ZoomMeetingType
                              ]
                            )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent
          value="completed"
          className="flex w-full h-full overflow-hidden"
        >
          <MeetingDataTable
            columns={completedColumns}
            data={completedMeetings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ZoomMeetingPage;
