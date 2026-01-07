"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";

import { useZoomMeetingStore } from "../stores/meetings";
import MeetingsSheetData from "../components/meetings/meetings-sheet-data";
import ZoomMeetingsCard from "../components/meetings/meetings-card";
import { ZoomMeeting } from "../types";

export default function ZoomMeetingsPage() {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [allMeetingLoading, setAllMeetingLoading] = useState<boolean>(false);

  const classroomId = Array.isArray(classroom_id)
    ? classroom_id[0]
    : classroom_id;

  const { meetings } = useZoomMeetingStore();

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting: ZoomMeeting) => {
      if (searchFilter) {
        const searchLower = searchFilter.toLowerCase();
        const matchesSearch =
          meeting.topic.toLowerCase().includes(searchLower) ||
          (meeting.agenda?.toLowerCase() || "").includes(searchLower);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [meetings, searchFilter]);

  return (
    <div className="flex flex-col gap-6 px-4 py-6 w-full h-full overflow-hidden">
      <div className="flex flex-col gap-6 w-full h-full">
        <header className="flex flex-wrap justify-between items-center gap-4 w-full">
          <Input
            type="text"
            placeholder="Procurando por algo?"
            className="max-w-xs"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />

          <MeetingsSheetData classroomId={classroomId} />
        </header>

        <ul className="flex flex-wrap items-start gap-4 pb-4 w-full h-full overflow-y-auto">
          {filteredMeetings
            .sort((a, b) => {
              return (
                new Date(b.start_time ?? 0).getTime() -
                new Date(a.start_time ?? 0).getTime()
              );
            })
            .map((meeting, i) => (
              <ZoomMeetingsCard
                key={`meeting-${i}`}
                meeting={meeting}
                allMeetingLoading={allMeetingLoading}
                setAllMeetingLoading={setAllMeetingLoading}
                expansive={true}
              />
            ))}
        </ul>
      </div>
    </div>
  );
}
