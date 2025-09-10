"use client";
import { ArrowUpDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ZoomMeetingPastInstanceT } from "@/types/classroom-zoom";
import {
  ZoomMeetingParticipantT,
  ZoomMeetingPollResultsT,
} from "@/types/classroom-zoom/meetings"; // Adjust path if needed
import { useZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";

// Utility function to format seconds to HH:MM:SS
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

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
        <p className="font-medium capitalize">{row.original.name}</p>
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
        <span className="lowercase">{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "question_details",
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
        <span className="text-sm">
          {row.original.question_details[0].answer}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "question_details",
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
        <span className="text-sm">
          {row.original.question_details[1].answer}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "question_details",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Auto-desenvolvimento</p>
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
        <span className="text-sm">
          {row.original.question_details[2].answer}
        </span>
      </div>
    ),
  },
];

function PollResultsTable({ data }: { data: ZoomMeetingPollResultsT[] }) {
  const table = useReactTable({
    data: data,
    columns: meetingPollResultsColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full max-h-full h-max flex border rounded-lg overflow-y-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-muted z-10 p-0!">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="shadow rounded-t-lg! overflow-hidden p-0!"
            >
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="p-0!">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="p-0! h-full! border-0!"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="p-0! h-full! border-0!">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={meetingPollResultsColumns.length}
                className="h-24 text-center"
              >
                Sem resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

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
        <p className="font-medium capitalize">{row.original.name}</p>
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
        <span className="lowercase">{row.original.user_email}</span>
      </div>
    ),
  },
  {
    accessorKey: "duration",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r bg-green-50">
          <p className="font-semibold">Presença</p>
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
      <div className="w-full h-full flex justify-center items-center px-2 border-r border-b bg-green-50">
        <p className="font-semibold">{formatDuration(row.original.duration)}</p>
      </div>
    ),
  },
  {
    accessorKey: "absence",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r bg-red-50">
          <p className="font-semibold">Ausência</p>
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
      <div className="w-full h-full flex justify-center items-center px-2 border-r border-b bg-red-50">
        <p className="font-semibold">{formatDuration(row.original.absence)}</p>
      </div>
    ),
  },
];

interface ParticipantsTableProps {
  data: (ZoomMeetingParticipantT & { absence: number })[];
}

function ParticipantsTable({ data }: ParticipantsTableProps) {
  const table = useReactTable({
    data,
    columns: meetingParticipantsColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex w-full h-full border rounded-lg !overflow-hidden">
      <Table>
        <TableHeader className="sticky top-0 bg-muted z-10 p-0!">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="shadow rounded-t-lg! overflow-hidden p-0!"
            >
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="p-0!">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="p-0! h-full! border-0!"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="p-0! h-full! border-0!">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={meetingParticipantsColumns.length}
                className="h-24 text-center"
              >
                Sem participantes.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

const PastInstancieDialog = ({
  open,
  onClose,
  instancie,
}: {
  open: boolean;
  onClose: (open: boolean) => void;
  instancie: ZoomMeetingPastInstanceT;
}) => {
  const participantGroups = new Map<string, ZoomMeetingParticipantT>();
  const { meetings } = useZoomMeetingStore();

  const currentMeeting = meetings.find(
    (meeting) => meeting.id === instancie.meeting_id
  );

  instancie.participants?.forEach((participant) => {
    const existing = participantGroups.get(participant.user_email);
    if (existing) {
      existing.duration += participant.duration;
    } else {
      participantGroups.set(participant.user_email, {
        ...participant,
        duration: participant.duration,
      });
    }
  });

  const participantsData = Array.from(participantGroups.values()).map((p) => {
    // Participant duration is already in seconds
    const participantDurationInSeconds = p.duration;

    // Meeting duration is in minutes, convert to seconds
    const meetingDurationInMinutes = currentMeeting?.duration || 0;
    const meetingDurationInSeconds = meetingDurationInMinutes * 60;

    // Calculate absence in seconds
    const absenceInSeconds = Math.max(
      0,
      meetingDurationInSeconds - participantDurationInSeconds
    );

    return {
      ...p,
      absence: absenceInSeconds,
    };
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-max h-full !min-w-[50vw] !min-h-[50vh] !max-w-[90vw] !max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            Instância ocorrida em{" "}
            {instancie.start_time
              ? format(new Date(instancie.start_time), "dd/MM/yyyy", {
                  locale: ptBR,
                })
              : "Data não disponível"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex w-full h-full overflow-hidden px-6 pb-6">
          <Tabs
            defaultValue="participants"
            className="w-full h-full flex flex-col overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="participants">Participantes</TabsTrigger>
              <TabsTrigger value="pollsResults">
                Resultados da Enquete
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="participants"
              className="flex w-full h-full overflow-hidden mt-4"
            >
              <ParticipantsTable data={participantsData} />
            </TabsContent>

            <TabsContent
              value="pollsResults"
              className="flex w-full h-full overflow-hidden mt-4"
            >
              <PollResultsTable
                data={instancie.poll_results?.filter(Boolean) || []}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PastInstancieDialog;
