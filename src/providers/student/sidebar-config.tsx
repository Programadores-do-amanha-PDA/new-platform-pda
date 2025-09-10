"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AuthUserWithProfileT,
  SidebarDataT,
  ClassroomT,
  ZoomMeetingT,
  ClassroomCoodeshAssessmentT,
  ClassroomProjectT,
} from "@/types";
import pathLabels from "@/utils/path-labels";
import { rolesLabelsOptions } from "@/utils/user-roles-labels";

export const generateSidebarConfig = (
  user: AuthUserWithProfileT,
  classrooms: ClassroomT[]
): SidebarDataT => {
  return {
    user,
    team: {
      name: "Estudante",
      logo: () => (
        <Avatar className="size-8">
          <AvatarImage src="/assets/logos/simbolo_pda_fundo_branco.png" />
          <AvatarFallback>PdA</AvatarFallback>
        </Avatar>
      ),
    },
    navMain: [],
    classRooms: classrooms
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((classroom) => ({
        title: classroom.name,
        ref: classroom.id,
        url: `/dashboard/classrooms/${classroom.id}`,
        icon: classroom.icon,
        isActive: false,
        items: [
          {
            title: pathLabels["projects"],
            url: `/dashboard/classrooms/${classroom.id}/projects`,
          },
        ],
      })),
    projects: [],
  };
};

export const generatePathLabels = (
  pathLabels: Record<string, string>,
  classrooms: ClassroomT[],
  meetings: ZoomMeetingT[],
  assessments: ClassroomCoodeshAssessmentT[],
  projects: ClassroomProjectT[]
): Record<string, string> => {
  const classroomLabels: Record<string, string> = {};
  const zoomMeetings: Record<string, string> = {};
  const coodeshAssessments: Record<string, string> = {};
  const classroomProjects: Record<string, string> = {};

  if (classrooms.length > 0) {
    classrooms.forEach(
      (classroom) => (classroomLabels[classroom.id] = classroom.name)
    );
  }

  if (meetings.length > 0) {
    meetings.forEach((meeting) => (zoomMeetings[meeting.id] = meeting.topic));
  }

  if (assessments.length > 0) {
    assessments.forEach((assessment) => {
      if (assessment.id && assessment.name) {
        coodeshAssessments[assessment.id] = assessment.name;
      }
    });
  }

  if (projects.length > 0) {
    projects.forEach(
      (project) => (classroomProjects[project.id] = project.title)
    );
  }

  return {
    ...pathLabels,
    ...classroomLabels,
    ...zoomMeetings,
    ...coodeshAssessments,
    ...classroomProjects,
  };
};

export const generateNoAccessSidebarConfig = (
  user: AuthUserWithProfileT
): SidebarDataT => {
  const getUserRoleLabel = () => {
    if (!user.profile.user_roles || user.profile.user_roles.length === 0) {
      return "Usuário";
    }

    const userRole = user.profile.user_roles[0].role;
    const roleOption = rolesLabelsOptions.find(
      (option) => option.value === userRole
    );
    return roleOption?.label || "Usuário";
  };

  return {
    user,
    team: {
      name: getUserRoleLabel(),
      logo: () => (
        <Avatar className="size-8">
          <AvatarImage src="/assets/logos/simbolo_pda_fundo_branco.png" />
          <AvatarFallback>PdA</AvatarFallback>
        </Avatar>
      ),
    },
  };
};
