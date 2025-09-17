"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Calendar, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { DateRange } from "react-day-picker";
import { ClassroomProjectT } from "@/features/dashboard/classroom-projects/types/project";
import { Separator } from "@/components/ui/separator";
import { useProjectStore } from "@/stores/modules/classrooms/projects";
import { useDeliveryStore } from "@/stores/modules/classrooms/projects/deliveries";
import { useCorrectionStore } from "@/stores/modules/classrooms/projects/corrections";
import DateIntervalPicker from "@/components/shared/date-interval/date-interval-picker";
import PermissionGuard from "@/components/shared/permission-guard";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/use-auth";
import { DynamicLucideIcon } from "@/components/shared/icons/dynamic-lucide-icon";
import RoleGuard from "@/components/shared/role-guard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ProjectDeliveryModal from "./project-delivery-modal";

type ProjectCardProps = {
  project: ClassroomProjectT;
  expansive: boolean;
  classroomId?: string;
};

const projectTypesLabels = {
  mini_project: { label: "Mini projeto", iconName: "code" },
  end_module_project: { label: "Projeto final", iconName: "braces" },
  end_module_english_project: {
    label: "English final project",
    iconName: "languages",
  },
};

const ProjectCard = ({ project, expansive, classroomId }: ProjectCardProps) => {
  const path = usePathname();
  const { updateProject } = useProjectStore();
  const { deliveries } = useDeliveryStore();
  const { corrections } = useCorrectionStore();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<DateRange | undefined>();
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

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

      await updateProject(project.id, {
        schedule_date: scheduleDate,
      });
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderProjectStatus = () => {
    const projectDeliveries = deliveries.filter(
      (delivery) => delivery.project_id === project.id
    );
    const userProjectDelivery = projectDeliveries.find(
      (delivery) => delivery.user_id === user?.id
    );
    const projectCorrections = corrections.filter(
      (correction) => correction.project_id === project.id
    );
    const userProjectCorrection = projectCorrections.find(
      (correction) => correction.delivery_id === userProjectDelivery?.id
    );

    const projectFromDate = new Date(
      project.schedule_date?.from || 0
    ).getTime();

    // Criar data de fechamento com hora específica ou 23:59 como padrão
    const closingTime = project.closing_time || "23:59";
    const [hours, minutes] = closingTime.split(":").map(Number);
    const projectToDate = new Date(project.schedule_date?.to || 0);
    projectToDate.setHours(hours, minutes, 59, 999); // Definir hora, minuto, segundo e milissegundo
    const projectToDateTime = projectToDate.getTime();

    const now = Date.now();

    if (!userProjectDelivery) {
      if (projectFromDate <= now && projectToDateTime >= now) {
        return (
          <div className="flex flex-col items-end gap-4 rounded-xl">
            <Button onClick={() => setIsDeliveryModalOpen(true)}>
              Entregar projeto
            </Button>
          </div>
        );
      } else if (projectFromDate > now) {
        return (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-semibold text-primary-foreground">
              Entrega disponível em breve
            </p>
          </div>
        );
      } else if (projectToDateTime < now) {
        return (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-semibold text-destructive">
              Não entregue
            </p>
          </div>
        );
      }
    }
    // Se estiver entregue
    else {
      // Sem correção
      if (!userProjectCorrection) {
        return (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-semibold text-primary-foreground">
              Correção pendente
            </p>
          </div>
        );
      }
      // Com correção - mostrar nota final
      else {
        return (
          <div className="flex flex-col items-start gap-4 bg-green-100 p-4 rounded-xl">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-green-800">
                Projeto corrigido
              </p>
              <Badge variant="secondary" className="w-fit">
                Nota: {userProjectCorrection.final_note || "N/A"}
              </Badge>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <>
      <li className="p-4 border rounded-lg max-w-xs w-80 h-max flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 truncate">
            <RoleGuard
              roles={["admin", "class_manager", "employer"]}
              fallback={
                <p className="font-semibold truncate">{project.title}</p>
              }
            >
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
            </RoleGuard>
            <p className="text-sm h-5 text-muted-foreground font-semibold">
              Módulo {project.module}
            </p>
            <div className="w-full flex flex-col gap-2">
              <p className="text-sm font-semibold">Período de entrega:</p>
              <Badge variant="outline" className="text-sm bg-muted gap-2">
                <Calendar />
                {project.schedule_date?.to ? (
                  <>
                    {format(project.schedule_date?.from || 0, "dd/LL/yy", {
                      locale: ptBR,
                    })}{" "}
                    -{" "}
                    {format(project.schedule_date.to, "dd/LL/yy", {
                      locale: ptBR,
                    })}
                    <span className="text-xs opacity-75">
                      até {project.closing_time || "23:59"}
                    </span>
                  </>
                ) : (
                  format(project.schedule_date?.from || 0, "dd/LL/yy", {
                    locale: ptBR,
                  })
                )}
              </Badge>
            </div>
          </div>
          <div
            className="rounded-full bg-primary/50 p-1"
            title={projectTypesLabels[project.project_type].label}
          >
            <DynamicLucideIcon
              name={projectTypesLabels[project.project_type].iconName}
              className="size-5 stroke-primary-foreground"
            />
          </div>
        </div>
        <RoleGuard
          roles={["admin", "class_manager", "employer", "teacher"]}
          fallback={renderProjectStatus()}
        >
          <PermissionGuard
            permissions={[
              "classroom_projects.update_all",
              "classroom_projects.update_self",
            ]}
          >
            {expansive &&
              (project.schedule_date &&
              project.schedule_date.to &&
              (() => {
                const closingTime = project.closing_time || "23:59";
                const [hours, minutes] = closingTime.split(":").map(Number);
                const endDate = new Date(project.schedule_date.to);
                endDate.setHours(hours, minutes, 59, 999);
                return endDate.getTime() > Date.now();
              })() ? (
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
                      {loading && (
                        <LoaderCircle className="size-5 animate-spin" />
                      )}
                      Salvar alterações
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Separator />
                  <div className="flex flex-col items-start gap-2">
                    <p className="text-sm h-5 text-muted-foreground flex gap-1 font-semibold">
                      Entregas:
                      <p className="font-normal">
                        {
                          deliveries.filter((d) => d.project_id === project.id)
                            .length
                        }
                      </p>
                    </p>
                    <p className="text-sm h-5 text-muted-foreground flex gap-1 font-semibold">
                      Correções:
                      <p className="font-normal">
                        {
                          corrections.filter((c) => c.project_id === project.id)
                            .length
                        }
                      </p>
                    </p>
                  </div>
                </>
              ))}
          </PermissionGuard>
        </RoleGuard>
      </li>

      {classroomId && (
        <ProjectDeliveryModal
          project={project}
          classroomId={classroomId}
          isOpen={isDeliveryModalOpen}
          onClose={() => setIsDeliveryModalOpen(false)}
        />
      )}
    </>
  );
};

export default ProjectCard;
