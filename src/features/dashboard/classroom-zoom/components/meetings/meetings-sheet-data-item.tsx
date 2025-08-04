"use client";
import { LoaderCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ZoomMeetingT } from "@/types/classroom-zoom/meetings";

const meetingTypes = {
  1: "Reunião instantânea",
  2: "Reunião agendada",
  3: "Reunião recorrente sem horário fixo",
  8: "Reunião recorrente com horário fixo",
};

export default function MeetingsSheetDataItem({
  meeting,
  isAddingMeeting,
  handleAddMeeting,
}: {
  meeting: ZoomMeetingT;
  handleAddMeeting: (account_id: ZoomMeetingT) => void;
  isAddingMeeting: string | null;
}) {
  return (
    <li key={meeting.id} className="p-2 border rounded-lg">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex flex-col gap-1 truncate">
          <h2 className="font-semibold text-sm truncate" title={meeting.topic}>
            {meeting.topic}
          </h2>
          <p className="text-xs text-gray-500 truncate">
            {meeting.agenda || "Sem descrição"}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {meetingTypes[meeting.type as keyof typeof meetingTypes] ||
              "Sem tipo"}
          </p>
        </div>
        <Button
          onClick={() => handleAddMeeting(meeting)}
          className="font-semibold min-w-9 min-h-9 cursor-pointer"
          size="icon"
          disabled={isAddingMeeting !== null}
        >
          {isAddingMeeting === meeting.id ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
        </Button>
      </div>
    </li>
  );
}
