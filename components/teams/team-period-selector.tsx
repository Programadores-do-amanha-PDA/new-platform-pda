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

export function TeamPeriodSelector() {
  return (
    <Select>
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
