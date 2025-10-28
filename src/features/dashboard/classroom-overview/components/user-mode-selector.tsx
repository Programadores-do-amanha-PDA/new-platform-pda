import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassroomConfigUserModeT } from "@/types/classroom-configs";

interface UserModeSelectorProps {
  options: ClassroomConfigUserModeT[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const UserModeSelector = ({
  options,
  value,
  onValueChange,
  placeholder = "Selecionar modo",
}: UserModeSelectorProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-7 w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((mode) => (
          <SelectItem key={mode.id} value={mode.id}>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: mode.color }}
              />
              <span>{mode.title}</span>
              <span className="text-xs text-muted-foreground">({mode.key})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default UserModeSelector;