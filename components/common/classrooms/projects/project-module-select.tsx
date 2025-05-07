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
import { ClassroomProjectModuleT } from "@/types/projects/project";

interface ProjectModuleSelectProps
  extends React.HTMLAttributes<HTMLSelectElement> {
  value: ClassroomProjectModuleT | "";
  onValueChange: (newValue: ClassroomProjectModuleT) => void;
  name?: string;
}

const modules: ClassroomProjectModuleT[] = ["0", "1", "2", "3", "4", "5"];

const ProjectModuleSelect = ({
  value,
  onValueChange,
  name,
}: ProjectModuleSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange} name={name}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione um módulo" />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectGroup accessKey="m">
          <SelectLabel>Módulos</SelectLabel>
          {modules.map((module) => (
            <SelectItem key={"module-" + module} value={module}>
              Módulo {module}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default ProjectModuleSelect;
