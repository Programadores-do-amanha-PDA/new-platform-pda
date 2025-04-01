"use client";
import { useMemo, useState } from "react";

import ZoomMeetingCard from "@/components/classrooms/zoom/meeting-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminStackContext } from "@/context/admin/stack-context";
import MeetingsSheetData from "@/components/classrooms/zoom/meetings-sheet-data";

type meetingStatusT = "all" | "upcoming" | "completed" | "past";

const meetingsStatusLabels = {
  all: "Todas",
  upcoming: "Próximas",
  completed: "Concluídas",
  cancelled: "Canceladas",
  past: "Passadas",
};

const ZoomMeetingsPage = ({ classroom_id }: { classroom_id: string }) => {
  const {
    classroomsStack: {
      zoom: { meetings },
    },
  } = useAdminStackContext();
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<meetingStatusT>("all");

  const { filteredMeetings, statusCount } = useMemo(() => {
    const now = Date.now();
    const count = { all: meetings.length, upcoming: 0, completed: 0, past: 0 };

    const filtered = meetings.filter((meeting) => {
      // Status calculation
      const startTime = new Date(meeting.start_time).getTime();
      const isUpcoming = startTime > now;
      const isCompleted = startTime <= now;
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
  }, [meetings, statusFilter, searchFilter]);

  const statusFilters: meetingStatusT[] = [
    "all",
    "upcoming",
    "completed",
    "past",
  ];

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
        <MeetingsSheetData classroom_id={classroom_id}  />
      </div>

      <ul className="w-full h-full flex flex-wrap items-start gap-4 overflow-y-auto px-2">
        {filteredMeetings
          .sort((a, b) => a.start_time.localeCompare(b.start_time))
          .map((meeting) => (
            <ZoomMeetingCard key={meeting.uuid} meeting={meeting} />
          ))}
      </ul>
    </div>
  );
};

export default ZoomMeetingsPage;
