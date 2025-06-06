import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminStackContext } from "@/context/admin/stack-context";
import {
  ZoomClassType,
  ZoomMeetingPastInstancesType,
  ZoomMeetingType,
} from "@/types/zoom/meetings";
import { useState } from "react";

const meetingTypes = [
  { id: "programming", name: "Programação" },
  { id: "english", name: "Inglês" },
  { id: "soft-skills", name: "Soft Skills" },
  { id: "community", name: "Comunidade" },
];

const MeetingTypeSelector = ({
  pastMeeting,
  type,
}: {
  pastMeeting: ZoomMeetingPastInstancesType | ZoomMeetingType;
  type: "meeting" | "pastInstance";
}) => {
  const [loading, setLoading] = useState(false);
  const {
    classroomsStack: {
      zoom: {
        meetings: {
          handleUpdateZoomMeeting,
          pastInstances: { handleUpdateZoomPastInstance },
        },
      },
    },
  } = useAdminStackContext();

  const handleValueChange = async (value: ZoomClassType) => {
    setLoading(true);
    if (pastMeeting.id && type === "meeting") {
      await handleUpdateZoomMeeting(pastMeeting.id, {
        class_type: value,
      });
      setLoading(false);
      return;
    } else if (pastMeeting.id && type === "pastInstance") {
      await handleUpdateZoomPastInstance(pastMeeting.id, { class_type: value });
      setLoading(false);
      return;
    }
  };

  return (
    <Select
      defaultValue={pastMeeting.class_type}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="!h-7" disabled={loading}>
        <SelectValue placeholder="Tipo de reunião" className="!h-7" />
      </SelectTrigger>
      <SelectContent>
        {meetingTypes.map((type) => (
          <SelectItem key={type.id} value={type.name}>
            {type.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
export default MeetingTypeSelector;
