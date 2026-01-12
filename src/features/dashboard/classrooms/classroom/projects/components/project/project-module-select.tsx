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

import { ProjectModuleSelectPropsT } from "../../types";
import { getDefaultModules } from "../../utils/projects/default-modules";
import { cn } from "@/lib/utils";
import { useClassroomSettingStore } from "../../../settings";

const ProjectModuleSelect = ({
  classroomId,
  value,
  onValueChange,
  name,
  error = false,
}: ProjectModuleSelectPropsT) => {
  const { settingsByClassroom } = useClassroomSettingStore();
  const currentConfig = settingsByClassroom[classroomId];
  const modules = currentConfig?.modules;
  const defaultModules = getDefaultModules();

  return (
    <Select value={value} onValueChange={onValueChange} name={name}>
      <SelectTrigger
        className={cn(
          "w-[180px]",
          error && "border-destructive focus:ring-destructive"
        )}
      >
        <SelectValue placeholder="Selecione um módulo" />
      </SelectTrigger>
      <SelectContent align="start">
        {modules.length > 0 && (
          <SelectGroup accessKey="m">
            <SelectLabel>Módulos da turma</SelectLabel>
            {modules.map((module) => (
              <SelectItem key={"module-" + module.id} value={module.id}>
                Módulo {module.title}
              </SelectItem>
            ))}
          </SelectGroup>
        )}

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
