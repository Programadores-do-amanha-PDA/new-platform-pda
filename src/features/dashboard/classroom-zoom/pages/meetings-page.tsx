"use client";
import { useMemo, useState } from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";
import MeetingsSheetData from "../components/meetings/meetings-sheet-data";
import ZoomMeetingsCard from "../components/meetings/meetings-card";

const ZoomMeetingsPage = () => {
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [allMeetingLoading, setAllMeetingLoading] = useState<boolean>(false);

  const { meetings } = useZoomMeetingStore();

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
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
  }, [meetings, searchFilter]);

  return (
    <div className="w-full h-full flex flex-col gap-6 py-6 overflow-hidden px-4">
      <div className="w-full h-full flex flex-col gap-6">
        <div className="w-full flex items-center justify-between flex-wrap p-4 gap-4">
          <div className="w-full max-w-xs min-w-72 flex gap-2 items-center shadow-xs rounded-md border px-2">
            <Input
              id="search"
              type="text"
              placeholder="Buscando algo?"
              className="max-w-xs border-none! ring-0! shadow-none rounded-none!"
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
};

export default ZoomMeetingsPage;
