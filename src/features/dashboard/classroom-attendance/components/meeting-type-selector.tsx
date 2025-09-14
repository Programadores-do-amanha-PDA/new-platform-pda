import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassroomConfigClassTypesT } from "@/types";
import { ZoomClassT } from "@/types/classroom-zoom/meetings";

// const meetingTypes = [
//   { id: "programming", name: "Programação" },
//   { id: "english", name: "Inglês" },
//   { id: "soft-skills", name: "Soft Skills" },
//   { id: "community", name: "Comunidade" },
//   { id: "employability", name: "Empregabilidade" },
// ];

const MeetingTypeSelector = ({
  options,
  value,
  handleValueChange,
}: {
  options: ClassroomConfigClassTypesT[];
  value: ZoomClassT | undefined;
  handleValueChange: (value: ZoomClassT) => void;
}) => {
  return (
    <Select value={value} onValueChange={handleValueChange}>
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
