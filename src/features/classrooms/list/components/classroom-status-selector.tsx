import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassroomStatusT } from "@/features/classrooms/types";

const classroomStatusLabels = [
  { id: "created", label: "Criada" },
  { id: "active", label: "Ativa" },
  { id: "finished", label: "Finalizada" },
];

const ClassroomStatusSelector = ({
  value,
  handleOnchange,
}: {
  value: ClassroomStatusT;
  handleOnchange: (value: ClassroomStatusT) => void;
}) => {
  return (
    <Select onValueChange={handleOnchange} value={value}>
      <SelectTrigger className="max-w-80 w-[190px]">
        <SelectValue className="w-full" placeholder="Selecione um status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Status</SelectLabel>
          {classroomStatusLabels.map((status) => (
            <SelectItem key={status.id} value={status.id}>
              {status.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default ClassroomStatusSelector;
