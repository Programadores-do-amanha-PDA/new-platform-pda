import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { activityTypes } from "../utils/activity-type-options";
import { ActivityTClassT } from "@/types";

const ActivityTypeSelector = ({
  value,
  handleValueChange,
}: {
  value: ActivityTClassT | undefined;
  handleValueChange: (value: ActivityTClassT) => void;
}) => {
  return (
    <Select
      value={value}
      onValueChange={(value) => handleValueChange(value as ActivityTClassT)}
    >
      <SelectTrigger className="h-7 w-full">
        <SelectValue placeholder="Tipo de atividade" className="h-7" />
      </SelectTrigger>
      <SelectContent>
        {activityTypes.map((type) => (
          <SelectItem key={type.id} value={type.id}>
            {type.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ActivityTypeSelector;
