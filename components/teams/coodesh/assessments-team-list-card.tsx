"use client";

import { CalendarPlus, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TeamCoodeshAssessments } from "@/types/assessments";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { AssessmentDatePicker } from "./assessments-date-picker";
import { useState } from "react";

const AssessmentsTeamListCard = ({
  assessment,
}: {
  assessment: TeamCoodeshAssessments;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  return (
    <li
      key={assessment.assessment_id}
      className="p-4 border rounded-lg max-w-xs w-80 h-max flex flex-col"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1 truncate">
          <h2 className="font-semibold truncate">{assessment.name}</h2>
          {assessment.description && (
            <p className="text-sm text-gray-500 truncate">
              {assessment.description}
            </p>
          )}
          {assessment.duration && (
            <p className="text-xs text-gray-500 truncate">
              {assessment.duration}{" "}
              {assessment.duration_unit === "hour" ? "horas" : "minutos"}
            </p>
          )}
        </div>
      </div>
      <Separator className="my-4" />
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1 truncate">
            {assessment.questions && (
              <p className="text-sm font-semibold truncate">
                {assessment.questions.length} questões
              </p>
            )}
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="shrink-0">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Alternar questões</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          {assessment.questions.map((question) => (
            <div
              key={question.name}
              className="rounded-md border px-4 py-2 text-sm shadow-sm"
            >
              <h3 className="font-semibold">{question.name}</h3>
              <p className="text-gray-600 mt-1">{question.description}</p>

              <div className="mt-2 flex flex-wrap gap-1">
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground truncate"
                >
                  {question.type_formatted}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground truncate"
                >
                  {question.level_formatted}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground truncate"
                >
                  {question.duration}{" "}
                  {question.duration_unit === "hour" ? "horas" : "minutos"}
                </Badge>
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
      <Separator className="my-4" />

      <div className="flex flex-col items-start gap-8">
        <div className="w-full flex flex-col gap-6">
          <div className="w-full flex flex-col gap-4">
            <Label htmlFor="startDate">Data de início:</Label>
            <AssessmentDatePicker date={startDate} setDate={setStartDate} />
          </div>
          <div className="w-full flex flex-col gap-4">
            <Label htmlFor="startDate">Data limite:</Label>
            <AssessmentDatePicker date={endDate} setDate={setEndDate} />
          </div>
        </div>
        <Button className="flex gap-4 font-semibold">
          <CalendarPlus className="size-5" />
          Adicionar ao cronograma
        </Button>
      </div>
    </li>
  );
};

export default AssessmentsTeamListCard;
