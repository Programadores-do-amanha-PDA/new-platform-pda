"use client";

import { ChevronsUpDown, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TeamCoodeshAssessments } from "@/types/coodesh/assessments";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { AssessmentDatePicker } from "./assessments-date-picker";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AssessmentsTeamListCard = ({
  assessment,
  handleUpdateTeamAssessment,
}: {
  assessment: TeamCoodeshAssessments;
  handleUpdateTeamAssessment: (
    assessmentId: string,
    assessmentData: Partial<TeamCoodeshAssessments>
  ) => Promise<boolean>;
}) => {
  const path = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [scheduleDate, setScheduleDate] = useState<DateRange | undefined>();
  const [isVisibleOnSchedule, setIsVisibleOnSchedule] =
    useState<boolean>(false);
  const [acceptLateDeliveries, setAcceptLateDeliveries] =
    useState<boolean>(false);

  useEffect(() => {
    if (assessment?.schedule_date?.from && assessment?.schedule_date?.to) {
      setScheduleDate({
        from: new Date(assessment?.schedule_date?.from),
        to: new Date(assessment?.schedule_date?.to),
      });
    }
    if (assessment.is_visible_on_schedule) {
      setIsVisibleOnSchedule(assessment.is_visible_on_schedule);
    }
    if (assessment.accept_late_deliveries) {
      setAcceptLateDeliveries(assessment.accept_late_deliveries);
    }
  }, [assessment]);

  const isEdit =
    assessment.accept_late_deliveries !== acceptLateDeliveries ||
    assessment.is_visible_on_schedule !== isVisibleOnSchedule ||
    (scheduleDate !== undefined &&
      assessment.schedule_date?.from !== undefined &&
      scheduleDate?.from !== undefined &&
      new Date(assessment.schedule_date.from).getTime() !==
        scheduleDate.from.getTime()) ||
    (assessment.schedule_date?.to !== undefined &&
      scheduleDate?.to !== undefined &&
      new Date(assessment.schedule_date.to).getTime() !==
        scheduleDate.to.getTime());

  const handleUpdateAssessment = async () => {
    setLoading(true);
    try {
      if (!assessment.id) throw new Error("Assessment ID is required");

      await handleUpdateTeamAssessment(assessment?.id, {
        accept_late_deliveries: acceptLateDeliveries,
        is_visible_on_schedule: isVisibleOnSchedule,
        schedule_date: scheduleDate,
      });
    } catch (error) {
      console.error("Error updating assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="p-4 border rounded-lg max-w-xs w-80 h-max flex flex-col">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1 truncate">
          <Link
            href={`${path}/${assessment.id}`}
            className="font-semibold truncate hover:underline cursor-pointer"
            title={assessment.name}
          >
            {assessment.name}
          </Link>
          <p
            className="text-sm h-5 text-gray-500"
            title={assessment.description}
          >
            {assessment.description}
          </p>
          <p className="text-xs h-4 text-gray-500 truncate">
            {assessment.duration}{" "}
            {assessment.duration_unit === "hour" ? "horas" : "minutos"}
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1 truncate">
            {assessment.questions && (
              <p className="text-sm font-semibold  truncate">
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

      <div className="flex flex-col items-start gap-8 bg-primary/25 p-4 rounded-xl">
        <div className="w-full flex flex-col gap-6">
          <div className="w-full flex flex-col gap-4">
            <Label htmlFor="startDate">Período de entregas:</Label>
            <AssessmentDatePicker
              date={scheduleDate}
              setDate={setScheduleDate}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`is_visible_on_schedule_${assessment.id}`}
            checked={isVisibleOnSchedule}
            onCheckedChange={(v: boolean) => setIsVisibleOnSchedule(v)}
            disabled={
              scheduleDate?.from === undefined || scheduleDate?.to === undefined
            }
          />
          <label
            htmlFor={`is_visible_on_schedule_${assessment.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Visível no calendário da turma?
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`accept_late_deliveries_${assessment.id}`}
            checked={acceptLateDeliveries}
            onCheckedChange={(v: boolean) => setAcceptLateDeliveries(v)}
            disabled={
              scheduleDate?.from === undefined || scheduleDate?.to === undefined
            }
          />
          <label
            htmlFor={`accept_late_deliveries_${assessment.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Aceitar entregas apos o prazo final?
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Button disabled={!isEdit} onClick={handleUpdateAssessment}>
            {loading && <LoaderCircle className="size-5 animate-spin" />}
            Salvar alterações
          </Button>
        </div>
      </div>
    </li>
  );
};

export default AssessmentsTeamListCard;
