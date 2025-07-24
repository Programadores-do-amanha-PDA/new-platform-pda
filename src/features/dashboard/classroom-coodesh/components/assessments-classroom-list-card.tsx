"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { DateRange } from "react-day-picker";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { ClassroomCoodeshAssessmentT } from "@/types/coodesh";
import DateIntervalPicker from "@/components/shared/date-interval-picker";
import { useCoodeshAssessmentStore } from "@/stores/modules/classrooms/coodesh/assessments";

type AssessmentsClassroomListCardProps = {
  assessment: ClassroomCoodeshAssessmentT;
  expansive: boolean;
};

const AssessmentsClassroomListCard = ({
  assessment,
  expansive,
}: AssessmentsClassroomListCardProps) => {
  const path = usePathname();
  const [loading, setLoading] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<DateRange | undefined>();
  const [isVisibleOnSchedule, setIsVisibleOnSchedule] =
    useState<boolean>(false);
  const [acceptLateDeliveries, setAcceptLateDeliveries] =
    useState<boolean>(false);

  const { updateAssessment } = useCoodeshAssessmentStore();
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

      await updateAssessment(assessment, {
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
    <li className="p-4 border rounded-lg max-w-xs w-80 h-max flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1 truncate">
          <Link
            href={
              expansive
                ? `${path}/${assessment.id}`
                : `${path}/assessments/${assessment.id}`
            }
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
          <p className="text-sm h-5 text-gray-500 flex gap-1">
            Duração:
            <p className="font-bold">
              {assessment.duration}{" "}
              {assessment.duration_unit === "hour" ? "horas" : "minutos"}
            </p>
          </p>
          <p className="text-sm h-5 text-gray-500 flex gap-1">
            Questões:
            <p className="font-bold">{assessment.questions.length}</p>
          </p>
        </div>
      </div>
      {expansive && (
        <div className="flex flex-col items-start gap-4 bg-primary/25 p-4 rounded-xl">
          <div className="w-full flex flex-col gap-6">
            <div className="w-full flex flex-col gap-2">
              <Label htmlFor="startDate" className="font-semibold">
                Período de entregas:
              </Label>
              <DateIntervalPicker
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
                scheduleDate?.from === undefined ||
                scheduleDate?.to === undefined
              }
            />
            <Label htmlFor={`is_visible_on_schedule_${assessment.id}`}>
              Visível no calendário da turma?
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`accept_late_deliveries_${assessment.id}`}
              checked={acceptLateDeliveries}
              onCheckedChange={(v: boolean) => setAcceptLateDeliveries(v)}
              disabled={
                scheduleDate?.from === undefined ||
                scheduleDate?.to === undefined
              }
            />
            <Label htmlFor={`accept_late_deliveries_${assessment.id}`}>
              Aceitar entregas apos o prazo final?
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Button disabled={!isEdit} onClick={handleUpdateAssessment}>
              {loading && <LoaderCircle className="size-5 animate-spin" />}
              Salvar alterações
            </Button>
          </div>
        </div>
      )}
    </li>
  );
};

export default AssessmentsClassroomListCard;
