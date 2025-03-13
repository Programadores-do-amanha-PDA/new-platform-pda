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
import { TeamPeriodsType } from "@/types/teams";

const teamPeriodLabels = {
  morning: "Manhã",
  afternoon: "Tarde",
  evening: "Noite",
};

const periods = [
  {
    id: "morning",
    name: "morning",
    label: teamPeriodLabels.morning,
  },
  {
    id: "afternoon",
    name: "afternoon",
    label: teamPeriodLabels.afternoon,
  },
  {
    id: "evening",
    name: "evening",
    label: teamPeriodLabels.evening,
  },
];

export function TeamPeriodSelector({
  value,
  handleOnchange,
}: {
  value: string;
  handleOnchange: (value: TeamPeriodsType) => void;
}) {
  return (
    <Select onValueChange={handleOnchange} value={value}>
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
}
