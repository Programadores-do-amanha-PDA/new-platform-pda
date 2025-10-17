"use client";

// Global imports
import { usePathname } from "next/navigation";
import Link from "next/link";

// Shared Components
import PermissionGuard from "@/components/shared/permission-guard";
import RoleGuard from "@/components/shared/role-guard";
import { DynamicLucideIcon } from "@/components/shared/icons/dynamic-lucide-icon";

// Local imports
import { ProjectCardPropsT } from "../../types";
import { projectTypesLabels, generateProjectHref } from "../../utils";
import { ProjectAdminControls } from "./project-admin-controls";
import { useDeliveryStore } from "../../stores/deliveries";
import { useCorrectionStore } from "../../stores/corrections";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";

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
  const { deliveries } = useDeliveryStore();
  const { corrections } = useCorrectionStore();

  const classroomDeliveries = deliveries[classroomId];
  const classroomCorrections = corrections[classroomId];

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
        className="rounded-md bg-primary/35 p-2"
      >
        <DynamicLucideIcon
          name={projectTypesLabels[project.project_type].iconName}
          className="size-5 stroke-primary-foreground stroke-2"
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
              className="truncate text-base cursor-default"
              id={`project-title-${project.id}`}
            >
              {project.title}
            </ItemTitle>
          }
        >
          <Link
            href={generateProjectHref(path, project.id, expansive)}
            className="font-semibold text-base truncate hover:underline cursor-pointer"
            title={`Ver detalhes do projeto: ${project.title}`}
            aria-label={`Ver detalhes do projeto: ${project.title}`}
          >
            <h3 id={`project-title-${project.id}`}>{project.title}</h3>
          </Link>
        </PermissionGuard>
      </ItemContent>
      <RoleGuard roles={["admin", "class_manager", "employer", "teacher"]}>
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
      </RoleGuard>
    </Item>
  );
};

export default ProjectCard;
