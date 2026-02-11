"use client"

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
import { ClassroomPeriodsT } from "@/features/classrooms/types";

const classroomPeriodLabels = {
  morning: "Manhã",
  afternoon: "Tarde",
  evening: "Noite",
};

const periods = [
  {
    id: "morning",
    name: "morning",
    label: classroomPeriodLabels.morning,
  },
  {
    id: "afternoon",
    name: "afternoon",
    label: classroomPeriodLabels.afternoon,
  },
  {
    id: "evening",
    name: "evening",
    label: classroomPeriodLabels.evening,
  },
];

const ClassroomPeriodSelector = ({
  value,
  handleOnchange,
}: {
  value?: ClassroomPeriodsT;
  handleOnchange: (value: ClassroomPeriodsT) => void;
}) => {
  return (
    <Select
      onValueChange={(value: string) =>
        handleOnchange(value as ClassroomPeriodsT)
      }
      value={value || undefined}
    >
      <SelectTrigger className="max-w-80 w-[190px]">
        <SelectValue className="w-full" placeholder="Selecione um período" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Períodos</SelectLabel>
          {periods.map((period) => (
            <SelectItem key={period.id} value={period.name}>
              {period.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default ClassroomPeriodSelector;
