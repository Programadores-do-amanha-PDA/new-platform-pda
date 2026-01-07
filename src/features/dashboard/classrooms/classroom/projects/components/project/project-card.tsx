"use client";

// Global imports
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, type JSX } from "react";

// Shared Components
import PermissionGuard from "@/components/shared/permission-guard";
import RoleGuard from "@/components/shared/role-guard";
import { DynamicLucideIcon } from "@/components/shared/icons/dynamic-lucide-icon";

// Local imports
import { ClassroomProjectDelivery, ProjectCardPropsT } from "../../types";
import {
  projectTypesLabels,
  generateProjectHref,
  formatDateRangePeriod,
  isProjectActive,
} from "../../utils";
import { ProjectAdminControls } from "./project-admin-controls";
import { useClassroomProjectDeliveriesStore } from "../../stores/deliveries";
import { useClassroomProjectCorrectionsStore } from "../../stores/corrections";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { ProjectStatusRenderer } from "./project-status-renderer";
import { Label } from "@/components/ui/label";
import ProjectDeliveryModal from "./project-delivery-modal";

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
}: ProjectCardPropsT): JSX.Element => {
  const path = usePathname();
  const { deliveries } = useClassroomProjectDeliveriesStore();
  const { corrections } = useClassroomProjectCorrectionsStore();
  const [currentDelivery, setCurrentDelivery] =
    useState<ClassroomProjectDelivery | null>(null);
  const [isOpenDeliveryModal, setIsOpenDeliveryModal] = useState(false);

  const classroomDeliveries = deliveries[classroomId];
  const classroomCorrections = corrections[classroomId];

  const isCurrentProjectActive = isProjectActive(project);

  const handleOpenCorrectionModal = (
    delivery: ClassroomProjectDelivery | null
  ) => {
    setCurrentDelivery(delivery);
    setIsOpenDeliveryModal(true);
  };

  const handleCloseCorrectionModal = () => {
    setCurrentDelivery(null);
    setIsOpenDeliveryModal(false);
  };

  return (
    <Item
      variant="default"
      role="article"
      aria-labelledby={`project-title-${project.id}`}
    >
      <ItemMedia
        role="img"
        title={projectTypesLabels[project.project_type].label}
        aria-label={`Tipo de projeto: ${
          projectTypesLabels[project.project_type].label
        }`}
        className="bg-primary/35 p-2 rounded-md"
      >
        <DynamicLucideIcon
          name={projectTypesLabels[project.project_type].iconName}
          className="stroke-2 stroke-primary-foreground size-5"
          aria-hidden="true"
        />
      </ItemMedia>
      <ItemContent>
        <PermissionGuard
          permissions={[
            "classroom_projects.update_all",
            "classroom_projects.delete_all",
            "classroom_projects.update_self",
            "classroom_projects.delete_self",
          ]}
          fallback={
            <ItemTitle
              className="text-base truncate cursor-default"
              id={`project-title-${project.id}`}
            >
              {project.title}
            </ItemTitle>
          }
        >
          <Link
            href={generateProjectHref(path, project.id, expansive)}
            className="font-semibold text-base hover:underline truncate cursor-pointer"
            title={`Ver detalhes do projeto: ${project.title}`}
            aria-label={`Ver detalhes do projeto: ${project.title}`}
          >
            <h3 id={`project-title-${project.id}`}>{project.title}</h3>
          </Link>
        </PermissionGuard>
      </ItemContent>
      {isCurrentProjectActive && (
        <div className="flex flex-col items-start px-4 py-1.5 rounded-md">
          <Label htmlFor={`date-picker-${project.id}`} className="text-xs">
            Período de entrega:
          </Label>
          <p className="font-semibold text-primary-foreground">
            {formatDateRangePeriod(project.schedule_date)}
          </p>
        </div>
      )}
      <PermissionGuard
        permissions={[
          "classroom_projects.update_all",
          "classroom_projects.update_self",
        ]}
      >
        <ProjectAdminControls
          project={project}
          classroomDeliveries={classroomDeliveries}
          classroomCorrections={classroomCorrections}
        />
      </PermissionGuard>
      <RoleGuard roles={["student"]}>
        <ProjectStatusRenderer
          classroomCorrections={classroomCorrections}
          classroomDeliveries={classroomDeliveries}
          classroomId={classroomId}
          project={project}
          onOpenDeliveryModal={handleOpenCorrectionModal}
        />
      </RoleGuard>

      <ProjectDeliveryModal
        project={project}
        classroomId={classroomId}
        isOpen={isOpenDeliveryModal}
        onClose={handleCloseCorrectionModal}
        currentDelivery={currentDelivery!}
      />
    </Item>
  );
};

export default ProjectCard;
