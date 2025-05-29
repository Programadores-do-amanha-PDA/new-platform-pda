import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const meetingTypes = [
  { id: "d", name: "Programação" },
  { id: "e", name: "Inglês" },
  { id: "s", name: "Soft Skills" },
  { id: "c", name: "Comunidade" },
];

const MeetingTypeSelector = ({
  value,
  handleValueChange,
}: {
  value: string;
  handleValueChange: (value: string) => void;
}) => {
  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className="!h-7">
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
