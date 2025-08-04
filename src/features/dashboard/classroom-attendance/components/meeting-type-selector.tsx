import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ZoomClassT } from "@/types/classroom-zoom/meetings";

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
  value: ZoomClassT | undefined;
  handleValueChange: (value: ZoomClassT) => void;
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
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className="h-7! w-full">
        <SelectValue placeholder="Tipo de reunião" className="h-7!" />
      </SelectTrigger>
      <SelectContent>
        {meetingTypes.map((type) => (
          <SelectItem key={type.id} value={type.id}>
            {type.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MeetingTypeSelector;