"use client";

// Global imports
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FileClock } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// UI Components
import { Badge } from "@/components/ui/badge";

// Shared Components
import PermissionGuard from "@/components/shared/permission-guard";
import RoleGuard from "@/components/shared/role-guard";
import { DynamicLucideIcon } from "@/components/shared/icons/dynamic-lucide-icon";

// Hooks
import useAuth from "@/hooks/use-auth";

// Local imports
import { ProjectCardPropsT } from "../../types";
import {
  analyzeDeliveryStatus,
  projectTypesLabels,
  isProjectActive,
  hasScheduleChanged,
  convertProjectScheduleToDateRange,
  generateProjectHref,
  handleProjectError
} from "../../utils";
import {  } from "../../utils/error-handling";
import { ProjectStatusRenderer } from "./project-status-renderer";
import { ProjectAdminControls } from "./project-admin-controls";
import { useProjectStore, } from "../../stores";
import { useDeliveryStore } from "../../stores/deliveries";
import { useCorrectionStore } from "../../stores/corrections";
import ProjectDeliveryModal from "./project-delivery-modal";

/**
 * Formats the delivery deadline (to date) with date and time
 * @param scheduleDate - The date range containing the delivery deadline
 * @returns Formatted delivery deadline string
 */
const formatDeliveryDeadline = (
  scheduleDate: DateRange | undefined
): string => {
  if (!scheduleDate?.to) return "Data não definida";

  return format(scheduleDate.to, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

/**
 * ProjectCard component displays project information with role-based functionality.
 * Supports both compact and expanded views with delivery and admin controls.
 *
 * @param props - The component props
 * @param props.project - The project data to display
 * @param props.expansive - Whether to show expanded view with additional controls
 * @param props.classroomId - Optional classroom ID for delivery modal
 * @returns JSX element representing the project card
 */
const ProjectCard = ({
  project,
  expansive,
  classroomId,
  classroomConfig,
}: ProjectCardPropsT): JSX.Element => {
  const path = usePathname();
  const { updateProject } = useProjectStore();
  const { deliveries } = useDeliveryStore();
  const { corrections } = useCorrectionStore();
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [scheduleDate, setScheduleDate] = useState<DateRange | undefined>();
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] =
    useState<boolean>(false);

  const classroomModules = classroomConfig?.modules || [];
  const classroomDeliveries = deliveries[classroomId];
  const classroomCorrections = corrections[classroomId];

  // Initialize schedule date from project data
  useEffect(() => {
    setScheduleDate(convertProjectScheduleToDateRange(project));
  }, [project]);

  // Check if schedule has been modified
  const hasChanges = hasScheduleChanged(project, scheduleDate);

  /**
   * Handles project update operations with proper error handling
   */
  const handleUpdateProject = async (): Promise<void> => {
    setLoading(true);
    try {
      if (!project.id) throw new Error("Project ID is required");

      await updateProject(project.id, {
        schedule_date: scheduleDate,
      });
    } catch (error) {
      handleProjectError(error, "handleUpdateProject");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renders project status based on user role and delivery state
   */
  const renderProjectStatus = (): JSX.Element | null => {
    if (!user?.id) return null;

    const deliveryStatus = analyzeDeliveryStatus(
      project,
      user.id,
      classroomDeliveries,
      classroomCorrections
    );

    return (
      <ProjectStatusRenderer
        deliveryStatus={deliveryStatus}
        projectTitle={project.title}
        onOpenDeliveryModal={() => setIsDeliveryModalOpen(true)}
      />
    );
  };

  return (
    <>
      <li
        className="p-4 border rounded-lg max-w-xs w-80 h-max flex flex-col gap-6 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
        role="article"
        aria-labelledby={`project-title-${project.id}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 truncate">
            <PermissionGuard
              permissions={[
                "classroom_projects.update_all",
                "classroom_projects.delete_all",
                "classroom_projects.update_self",
                "classroom_projects.delete_self",
              ]}
              fallback={
                <h3
                  id={`project-title-${project.id}`}
                  className="font-semibold truncate"
                >
                  {project.title}
                </h3>
              }
            >
              <Link
                href={generateProjectHref(path, project.id, expansive)}
                className="font-semibold truncate hover:underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                title={`Ver detalhes do projeto: ${project.title}`}
                aria-label={`Ver detalhes do projeto: ${project.title}`}
              >
                <h3 id={`project-title-${project.id}`}>{project.title}</h3>
              </Link>
            </PermissionGuard>
            <p
              className="text-sm h-5 text-muted-foreground font-semibold"
              aria-label={`Módulo ${project.module}`}
            >
              {classroomModules.find((module) => module.id === project.module)
                ?.title || `Módulo ${project.module}`}
            </p>
            <div className="w-full flex flex-col gap-2">
              <p
                className="text-sm font-semibold"
                id={`delivery-period-${project.id}`}
              >
                Data final entrega:
              </p>
              <Badge
                variant="outline"
                className="text-sm bg-muted gap-2 h-9"
                aria-labelledby={`delivery-period-${project.id}`}
              >
                <FileClock aria-hidden="true" className="size-4!" />
                {formatDeliveryDeadline(scheduleDate)}
              </Badge>
            </div>
          </div>
          <div
            className="rounded-full bg-primary/50 p-1"
            title={projectTypesLabels[project.project_type].label}
            aria-label={`Tipo de projeto: ${
              projectTypesLabels[project.project_type].label
            }`}
            role="img"
          >
            <DynamicLucideIcon
              name={projectTypesLabels[project.project_type].iconName}
              className="size-5 stroke-primary-foreground"
              aria-hidden="true"
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
            {expansive && (
              <ProjectAdminControls
                project={project}
                isActive={isProjectActive(project)}
                scheduleDate={scheduleDate}
                onScheduleDateChange={setScheduleDate}
                loading={loading}
                hasChanges={hasChanges}
                onUpdateProject={handleUpdateProject}
                deliveries={classroomDeliveries}
                corrections={classroomCorrections}
              />
            )}
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
