import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserMode } from "../../settings";

interface UserModeSelectorProps {
  options: UserMode[];
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
      <SelectTrigger className="w-full h-7">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((mode) => (
          <SelectItem key={mode.id} value={mode.id}>
            <div className="flex items-center gap-2">
              <div
                className="rounded-full w-3 h-3"
                style={{ backgroundColor: mode.color }}
              />
              <span>{mode.title}</span>
              <span className="text-muted-foreground text-xs">({mode.key})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default UserModeSelector;