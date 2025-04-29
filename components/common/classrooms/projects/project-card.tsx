"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import DateIntervalPicker from "@/components/common/date-interval-picker";

import { DateRange } from "react-day-picker";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { ClassroomProjectWithDeliveriesAndCorrectionsT } from "@/types/projects/project";
import { Separator } from "@/components/ui/separator";

type ProjectCardProps = {
  project: ClassroomProjectWithDeliveriesAndCorrectionsT;
  expansive: boolean;
};

const projectTypesLabels = {
  mini_project: "Mini projeto",
  end_module_project: "Projeto final",
  end_module_english_project: "English final project",
};

const ProjectCard = ({ project, expansive }: ProjectCardProps) => {
  const path = usePathname();
  const { classroomsStack } = useAdminStackContext();
  const {
    projects: { handleUpdateClassroomProject },
  } = classroomsStack;

  const [loading, setLoading] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<DateRange | undefined>();

  useEffect(() => {
    if (project.schedule_date?.from && project.schedule_date?.to) {
      setScheduleDate({
        from: new Date(project.schedule_date.from),
        to: new Date(project.schedule_date.to),
      });
    } else {
      setScheduleDate(undefined);
    }
  }, [project]);

  const isEdit =
    (project.schedule_date?.from &&
      scheduleDate?.from &&
      new Date(project.schedule_date.from).getTime() !==
        scheduleDate.from.getTime()) ||
    (project.schedule_date?.to &&
      scheduleDate?.to &&
      new Date(project.schedule_date.to).getTime() !==
        scheduleDate.to.getTime()) ||
    (project.schedule_date === undefined && scheduleDate !== undefined) ||
    (scheduleDate === undefined && project.schedule_date !== undefined);

  const handleUpdateProject = async () => {
    setLoading(true);
    try {
      if (!project.id) throw new Error("Project ID is required");

      await handleUpdateClassroomProject(project.id, {
        schedule_date: scheduleDate,
      });
    } catch (error) {
      console.error("Error updating project:", error);
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
                ? `${path}/${project.id}`
                : `${path}/projects/${project.id}`
            }
            className="font-semibold truncate hover:underline cursor-pointer"
            title={project.title}
          >
            {project.title}
          </Link>
          <p className="text-sm h-5 text-gray-500 font-semibold">
            Módulo {project.module}
          </p>
          <p className="text-sm h-5 text-gray-500 font-semibold flex gap-1">
            Tipo:
            <p className="font-normal">
              {projectTypesLabels[project.project_type]}
            </p>
          </p>
          <p className="text-sm h-5 text-gray-500 font-semibold flex gap-1">
            Criado em:
            <p className="font-normal">
              {new Date(project.created_at).toLocaleDateString()}
            </p>
          </p>
        </div>
      </div>
      {expansive &&
        (project.schedule_date &&
        project.schedule_date.to &&
        new Date(project.schedule_date.to).getTime() > Date.now() ? (
          <div className="flex flex-col items-start gap-4 bg-primary/25 p-4 rounded-xl">
            <div className="w-full flex flex-col gap-6">
              <div className="w-full flex flex-col gap-2">
                <Label htmlFor="startDate" className="font-semibold">
                  Período de entrega:
                </Label>
                <DateIntervalPicker
                  date={scheduleDate}
                  setDate={setScheduleDate}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button disabled={!isEdit} onClick={handleUpdateProject}>
                {loading && <LoaderCircle className="size-5 animate-spin" />}
                Salvar alterações
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Separator />
            <div className="flex flex-col items-start gap-2">
              <p className="text-sm h-5 text-gray-500 flex gap-1 font-semibold">
                Entregas:
                <p className="font-normal">{project.deliveries?.length ?? 0}</p>
              </p>
              <p className="text-sm h-5 text-gray-500 flex gap-1 font-semibold">
                Correções:
                <p className="font-normal">
                  {project.corrections?.length ?? 0}
                </p>
              </p>
            </div>
          </>
        ))}
    </li>
  );
};

export default ProjectCard;
