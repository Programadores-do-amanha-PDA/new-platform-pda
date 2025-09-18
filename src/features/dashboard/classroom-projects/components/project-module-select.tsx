"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ProjectModuleSelectProps } from "../types";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";
import { getDefaultModules } from "../utils/default-modules";

const ProjectModuleSelect = ({
  classroomId,
  value,
  onValueChange,
  name,
}: ProjectModuleSelectProps) => {
  const { configsByClassroom } = useClassroomConfigStore();
  const currentConfig = configsByClassroom[classroomId];
  const modules = currentConfig?.modules;
  const defaultModules = getDefaultModules();

  return (
    <Select value={value} onValueChange={onValueChange} name={name}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione um módulo" />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectGroup accessKey="m">
          <SelectLabel>Módulos</SelectLabel>
          {modules.map((module) => (
            <SelectItem key={"module-" + module.id} value={module.id}>
              Módulo {module.title}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup accessKey="d">
          <SelectLabel>Módulos padrão</SelectLabel>
          {defaultModules.map((module) => (
            <SelectItem key={"default-module-" + module.id} value={module.id}>
            {module.title}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default ProjectModuleSelect;
