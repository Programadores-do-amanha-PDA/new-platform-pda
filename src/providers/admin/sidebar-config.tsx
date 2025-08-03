"use client";
import { Moon, Sun, Sunrise, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClassroomT } from "@/types/classrooms";
import { AuthUserWithProfileT } from "@/types/auth";
import { ZoomMeetingT } from "@/types/classroom-zoom/meetings";
import { SidebarDataT } from "@/types/sidebar";
import { ClassroomCoodeshAssessmentT } from "@/types/classroom-coodesh";
import { ClassroomProjectT } from "@/types/classroom-projects";
import pathLabels from "@/utils/path-labels";
import { rolesLabelsOptions } from "@/utils/user-roles-labels";

export const classroomPeriodsIcons = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Moon,
};

export const generateSidebarConfig = (
  user: AuthUserWithProfileT,
  classrooms: ClassroomT[]
): SidebarDataT => {
  return {
    user,
    team: {
      name: "Administrador",
      logo: () => (
        <Avatar className="size-8">
          <AvatarImage src="/assets/logos/simbolo_pda_fundo_branco.png" />
          <AvatarFallback>PdA</AvatarFallback>
        </Avatar>
      ),
    },
    navMain: [
      {
        title: pathLabels["users"],
        url: "/dashboard/users",
        ref: "users",
        icon: Users,
        items: [
          {
            title: pathLabels["all_users"],
            url: "/dashboard/users/all",
          },
        ],
      },
      // {
      //   title: pathLabels["jobs"],
      //   url: "/dashboard/jobs",
      //   ref: "jobs",
      //   icon: Briefcase,
      //   isActive: false,
      //   items: [
      //     {
      //       title: pathLabels["curated"],
      //       url: "/dashboard/jobs/curated",
      //     },
      //     {
      //       title: pathLabels["curation"],
      //       url: "/dashboard/jobs/curation",
      //     },
      //     {
      //       title: pathLabels["archives"],
      //       url: "/dashboard/jobs/archives",
      //     },
      //   ],
      // },
    ],
    classRooms: classrooms
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((classroom) => ({
        title: classroom.name,
        ref: classroom.id,
        url: `/dashboard/classrooms/${classroom.id}`,
        icon: classroomPeriodsIcons[
          classroom.period as keyof typeof classroomPeriodsIcons
        ],
        isActive: false,
        items: [
          {
            title: pathLabels["overview"],
            url: `/dashboard/classrooms/${classroom.id}/overview`,
          },
          {
            title: pathLabels["attendance"],
            url: `/dashboard/classrooms/${classroom.id}/attendance`,
          },
          {
            title: pathLabels["activities"],
            url: `/dashboard/classrooms/${classroom.id}/activities`,
          },
          {
            title: pathLabels["projects"],
            url: `/dashboard/classrooms/${classroom.id}/projects`,
          },
          {
            title: pathLabels["coodesh"],
            url: `/dashboard/classrooms/${classroom.id}/coodesh`,
          },
          {
            title: pathLabels["zoom"],
            url: `/dashboard/classrooms/${classroom.id}/zoom`,
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
