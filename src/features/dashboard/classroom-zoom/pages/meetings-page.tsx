"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";

import { useZoomMeetingStore } from "../stores/meetings";
import MeetingsSheetData from "../components/meetings/meetings-sheet-data";
import ZoomMeetingsCard from "../components/meetings/meetings-card";
import { ZoomMeetingT } from "../types";

export default function ZoomMeetingsPage() {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [allMeetingLoading, setAllMeetingLoading] = useState<boolean>(false);

  const classroomId = Array.isArray(classroom_id)
    ? classroom_id[0]
    : classroom_id;

  const { meetings } = useZoomMeetingStore();

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting: ZoomMeetingT) => {
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
    <div className="w-full h-full flex flex-col gap-6 py-6 overflow-hidden px-4">
      <div className="w-full h-full flex flex-col gap-6">
        <header className="w-full flex items-center justify-between flex-wrap gap-4">
          <Input
            type="text"
            placeholder="Procurando por algo?"
            className="max-w-xs"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />

          <MeetingsSheetData classroomId={classroomId} />
        </header>

        <ul className="w-full h-full flex flex-wrap items-start gap-4 overflow-y-auto pb-4">
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
