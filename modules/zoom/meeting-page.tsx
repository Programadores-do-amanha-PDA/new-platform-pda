"use client";
import { useMemo, useState } from "react";

import ZoomMeetingCard from "@/components/classrooms/zoom/meetings/meetings-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminStackContext } from "@/context/admin/stack-context";
import MeetingsSheetData from "@/components/classrooms/zoom/meetings/meetings-sheet-data";
import { ZoomMeetingType } from "@/types/zoom/meetings";

type meetingStatusT = "all" | "upcoming" | "completed";

const meetingsStatusLabels = {
  all: "Todas",
  upcoming: "Próximas",
  completed: "Concluídas",
  cancelled: "Canceladas",
};

const ZoomMeetingPage = ({ meeting_id }: { meeting_id: string }) => {
  const {
    classroomsStack: {
      zoom: {
        meetings: { meetings },
      },
    },
  } = useAdminStackContext();
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<meetingStatusT>("all");

  const allMeetings = meetings
    .filter((m) => m._id === meeting_id)
    .map((meeting) => {
      let pastInstancies: ZoomMeetingType[] = [];
      let occurrences: ZoomMeetingType[] = [];

      if (meeting.past_instances?.length > 0) {
        pastInstancies = meeting.past_instances.map((instance) => {
          return {
            ...meeting,
            id: meeting.id,
            uuid: instance.uuid,
            start_time: instance.start_time,
            participants: instance.participants,
            poll_results: instance.poll_results,
            past_instances: [],
            occurrences: [],
            children_type: "past_instance",
          } as ZoomMeetingType;
        });
      }

      if (meeting.occurrences && meeting.occurrences?.length > 0) {
        occurrences = meeting.occurrences.map((occurrence) => {
          return {
            ...meeting,
            id: Number(occurrence.occurrence_id),
            start_time: occurrence.start_time,
            participants: [],
            poll_results: [],
            past_instances: [],
            occurrences: [],
            children_type: "occurrence",
          } as ZoomMeetingType;
        });
      }

      return [...pastInstancies, ...occurrences];
    })
    .flat();

  const { filteredMeetings, statusCount } = useMemo(() => {
    const count = { all: allMeetings.length, upcoming: 0, completed: 0 };

    const filtered = allMeetings.filter((meeting) => {
      // Status calculation

      const startTime = new Date(meeting.start_time || 0).getTime();
      const endTime = new Date(startTime + (meeting.duration || 0)).getTime();
      const isUpcoming = endTime > Date.now();
      const isCompleted = endTime < Date.now();
      const status: meetingStatusT = isUpcoming ? "upcoming" : "completed";

      // Update counts
      if (isUpcoming) count.upcoming++;
      if (isCompleted) count.completed++;

      // Status filter
      if (statusFilter !== "all" && status !== statusFilter) return false;

      // Search filter
      if (searchFilter) {
        const searchLower = searchFilter.toLowerCase();
        const matchesSearch =
          meeting.topic.toLowerCase().includes(searchLower) ||
          (meeting.agenda?.toLowerCase() || "").includes(searchLower);
        if (!matchesSearch) return false;
      }

      return true;
    });

    return { filteredMeetings: filtered, statusCount: count };
  }, [allMeetings, statusFilter, searchFilter]);

  const statusFilters: meetingStatusT[] = ["all", "upcoming", "completed"];

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="w-full flex items-center justify-between flex-wrap p-4 gap-4">
        <div className="w-max h-9 flex gap-4">
          {statusFilters.map((filter, index) => (
            <div key={filter} className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter(filter)}
              >
                <p
                  className={`text-sm font-semibold ${
                    statusFilter === filter ? "text-primary" : ""
                  }`}
                >
                  {meetingsStatusLabels[filter]}
                </p>
                <Badge
                  variant={statusFilter === filter ? "default" : "outline"}
                >
                  {statusCount[filter]}
                </Badge>
              </Button>
              {index < statusFilters.length - 1 && (
                <div className="h-full w-px border-l border-sidebar-accent" />
              )}
            </div>
          ))}
        </div>

        <div className="w-full max-w-xs min-w-72 flex gap-2 items-center shadow-sm rounded-md border px-2">
          <Input
            id="search"
            type="text"
            placeholder="Buscando algo?"
            className="max-w-xs !border-none !ring-0 shadow-none !rounded-none"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          <Label htmlFor="search">
            <Search className="size-5 text-primary-foreground" />
          </Label>
        </div>
        <MeetingsSheetData />
      </div>

      <ul className="w-full h-full flex flex-wrap items-start gap-4 overflow-y-auto px-2 pb-4">
        {filteredMeetings
          .sort((a, b) => {
            if (statusFilter === "all") {
              return (
                new Date(b.start_time ?? 0).getTime() -
                new Date(a.start_time ?? 0).getTime()
              );
            } else if (statusFilter === "upcoming") {
              return (
                new Date(a.start_time ?? 0).getTime() -
                new Date(b.start_time ?? 0).getTime()
              );
            } else if (statusFilter === "completed") {
              return (
                new Date(b.start_time ?? 0).getTime() -
                new Date(a.start_time ?? 0).getTime()
              );
            }

            return (
              new Date(b.start_time ?? 0).getTime() -
              new Date(a.start_time ?? 0).getTime()
            );
          })
          .map((meeting, i) => (
            <ZoomMeetingCard key={`meeting-${i}`} meeting={meeting} />
          ))}
      </ul>
    </div>
  );
};

export default ZoomMeetingPage;
