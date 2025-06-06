import { Button } from "@/components/ui/button";
import { ZoomMeetingType } from "@/types/zoom/meetings";
import { LoaderCircle, Plus } from "lucide-react";

const meetingTypes = {
  1: "Reunião instantânea",
  2: "Reunião agendada",
  3: "Reunião recorrente sem horário fixo",
  8: "Reunião recorrente com horário fixo",
};

const MeetingsSheetDataItem = ({
  meeting,
  isAddingMeeting,
  handleAddMeeting,
}: {
  meeting: ZoomMeetingType;
  handleAddMeeting: (account_id: ZoomMeetingType) => void;
  isAddingMeeting: number | null;
}) => {
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
          className="font-semibold min-w-9 min-h-9"
          size="icon"
          disabled={isAddingMeeting !== null}
        >
          {isAddingMeeting === meeting.meeting_id ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
        </Button>
      </div>
    </li>
  );
};
export default MeetingsSheetDataItem;
