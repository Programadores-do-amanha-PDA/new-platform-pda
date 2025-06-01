import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ZoomClassType } from "@/types/zoom/meetings";

const meetingTypes = [
  { id: "programming", name: "Programação" },
  { id: "english", name: "Inglês" },
  { id: "soft-skills", name: "Soft Skills" },
  { id: "community", name: "Comunidade" },
];

const MeetingTypeSelector = ({
  value,
  handleValueChange,
}: {
  value: ZoomClassType | undefined;
  handleValueChange: (value: ZoomClassType) => void;
}) => {
  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className="h-7!">
        <SelectValue placeholder="Tipo de reunião" className="h-7!" />
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
