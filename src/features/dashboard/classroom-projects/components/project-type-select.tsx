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
import { ClassroomProjectTypeT } from "@/features/dashboard/classroom-projects/types/project";
import { cn } from "@/lib/utils";

interface ProjectTypeSelectProps
  extends React.HTMLAttributes<HTMLSelectElement> {
  value: ClassroomProjectTypeT | "";
  onValueChange: (newValue: ClassroomProjectTypeT) => void;
  name?: string;
  error?: boolean;
}

const projectTypes = [
  { value: "mini_project", label: "Mini Projeto" },
  { value: "end_module_project", label: "Projeto Final" },
  { value: "end_module_english_project", label: "Projeto Final de Inglês" },
];

const ProjectTypeSelect = ({
  value,
  onValueChange,
  name,
  error = false
}: ProjectTypeSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange} name={name}>
      <SelectTrigger className={cn("w-[180px]", error && "border-destructive focus:ring-destructive")}>
        <SelectValue placeholder="Selecione um tipo" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Módulos</SelectLabel>
          {projectTypes.map((type) => (
            <SelectItem key={"type-" + type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default ProjectTypeSelect;
