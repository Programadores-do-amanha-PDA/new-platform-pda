"use client";
import { useMemo, useState } from "react";

import ZoomMeetingCard from "@/components/classrooms/zoom/meeting-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const meetingsAPIExample = [
  {
    agenda: "My Meeting 1",
    created_at: "2025-03-23T05:31:16Z",
    duration: 60,
    host_id: "30R7kT7bTIKSNUFEuH_Qlg",
    id: 97763643886,
    join_url: "https://example.com/j/11111",
    pmi: "97891943927",
    start_time: "2025-03-23T06:00:00Z",
    timezone: "America/Los_Angeles",
    topic: "My Meeting 2",
    type: 2,
    uuid: "aDYlohsHRtCd4ii1uC2+hA==",
    participants: [
      {
        id: "30R7kT7bTIKSNUFEuH_Qlg",
        name: "Jill Chill",
        user_id: "27423744",
        registrant_id: "_f08HhPJS82MIVLuuFaJPg",
        user_email: "jchill@example.com",
        join_time: "2022-03-23T06:58:09Z",
        leave_time: "2022-03-23T07:02:28Z",
        duration: 259,
        failover: false,
        status: "in_meeting",
        internal_user: false,
      },
      {
        id: "30R7kT7bTIKSNUFEuH_Qlg",
        name: "Jill Chill",
        user_id: "27423744",
        registrant_id: "_f08HhPJS82MIVLuuFaJPg",
        user_email: "jchill@example.com",
        join_time: "2022-03-23T06:58:09Z",
        leave_time: "2022-03-23T07:02:28Z",
        duration: 259,
        failover: false,
        status: "in_meeting",
        internal_user: false,
      },
      {
        id: "30R7kT7bTIKSNUFEuH_Qlg",
        name: "Jill Chill",
        user_id: "27423744",
        registrant_id: "_f08HhPJS82MIVLuuFaJPg",
        user_email: "jchill@example.com",
        join_time: "2022-03-23T06:58:09Z",
        leave_time: "2022-03-23T07:02:28Z",
        duration: 259,
        failover: false,
        status: "in_meeting",
        internal_user: false,
      },
    ],
    is_visible_on_schedule: true,
  },
  {
    agenda: "My Meeting",
    created_at: "2025-04-23T05:31:16Z",
    duration: 60,
    host_id: "30R7kT7bTIKSNUFEuH_Qlg",
    id: 97763643886,
    join_url: "https://example.com/j/11111",
    pmi: "97891943927",
    start_time: "2025-04-23T06:00:00Z",
    timezone: "America/Los_Angeles",
    topic: "My Meeting",
    type: 2,
    uuid: "aDYlohsHRtCd4ii1uC2+hAasdasd==",
  },
];

type meetingStatusT = "all" | "upcoming" | "completed" | "past";

const meetingsStatusLabels = {
  all: "Todas",
  upcoming: "Próximas",
  completed: "Concluídas",
  cancelled: "Canceladas",
  past: "Passadas",
};
const ZoomMeetingsPage = ({ classroom_id }: { classroom_id: string }) => {
  const [meetings, setMeetings] = useState(meetingsAPIExample);
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
