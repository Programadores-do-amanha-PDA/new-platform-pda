import { ClassroomConfigClassTypesT } from "@/types";
import {
  ZoomClassT,
  ZoomMeetingPastInstanceT,
  ZoomMeetingT,
} from "../../classroom-zoom/types";
import {
  useZoomMeetingPastInstanceStore,
  useZoomMeetingStore,
} from "../../classroom-zoom/stores";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MeetingTypeSelector = ({
  options,
  meeting,
}: {
  options: ClassroomConfigClassTypesT[];
  meeting:
    | (ZoomMeetingPastInstanceT & {
        meeting_type: "meeting" | "pastInstance";
      })
    | (ZoomMeetingT & {
        meeting_type: "meeting" | "pastInstance";
      });
}) => {
  const { updatePastInstanceById } = useZoomMeetingPastInstanceStore();
  const { updateMeeting } = useZoomMeetingStore();

  const handleValueChange = (id: ZoomClassT) => {
    if (meeting.meeting_type === "meeting" && id) {
      updateMeeting(meeting.id, { class_type: id });
    } else if (meeting.meeting_type === "pastInstance" && id) {
      updatePastInstanceById(meeting.id, { class_type: id });
    }
  };

  return (
    <Select value={meeting.class_type} onValueChange={handleValueChange}>
      <SelectTrigger className="h-7! w-full">
        <SelectValue placeholder="Tipo de reunião" className="h-7!" />
      </SelectTrigger>
      <SelectContent>
        {options.map((type) => (
          <SelectItem key={type.id} value={type.id}>
            {type.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MeetingTypeSelector;
