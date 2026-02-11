"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useZoomMeetingStore } from "@/features/classroom-zoom/stores/meetings";
import { useZoomMeetingPastInstanceStore } from "@/features/classroom-zoom/stores/past-instances";
import { ZoomMeeting, ZoomClassT } from "@/features/classroom-zoom/types/meetings";
import { ZoomMeetingPastInstance } from "@/features/classroom-zoom/types/past-instances";
import { ClassTypes } from "@/features/classrooms/settings";

const MeetingTypeSelector = ({
  options,
  meeting,
}: {
  options: ClassTypes[];
  meeting:
    | (ZoomMeetingPastInstance & {
        meeting_type: "meeting" | "pastInstance";
      })
    | (ZoomMeeting & {
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
      <SelectTrigger className="w-full h-7!">
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
