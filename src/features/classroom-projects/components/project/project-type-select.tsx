"use client";

import { cn } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { projectTypesLabels } from "../../utils/projects/project-type-labels";
import { ProjectTypeSelectPropsT } from "../../types/projects/project";

const ProjectTypeSelect = ({
  value,
  onValueChange,
  name,
  error = false,
}: ProjectTypeSelectPropsT) => {
  return (
    <Select value={value} onValueChange={onValueChange} name={name}>
      <SelectTrigger
        className={cn(
          "w-[180px]",
          error && "border-destructive focus:ring-destructive"
        )}
      >
        <SelectValue placeholder="Selecione um tipo" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tipos de projeto</SelectLabel>
          {projectTypesLabels &&
            Object.entries(projectTypesLabels).map(([key, type]) => (
              <SelectItem key={"type-" + key} value={key}>
                {type.label}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default ProjectTypeSelect;
