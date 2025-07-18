"use client";
import { Briefcase, Moon, Sun, Sunrise, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ClassroomT } from "@/types/classrooms";
import { AuthUserWithProfileT, RolesT } from "@/types/auth";
import { ZoomMeetingT } from "@/types/zoom/meetings";
import { SidebarDataT } from "@/types/sidebar";
import { ClassroomCoodeshAssessmentT } from "@/types/coodesh";
import { ClassroomProjectT } from "@/types/projects";

export const classroomPeriodsIcons = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Moon,
};

export const generateSidebarConfig = (
  user: AuthUserWithProfileT,
  userRole: RolesT,
  classrooms: ClassroomT[]
): SidebarDataT => {
  return {
    user,
    userRole,
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
        title: "Usuários",
        url: "/dashboard/admin/users",
        ref: "users",
        icon: Users,
        items: [
          {
            title: "Todos os usuários",
            url: "/dashboard/admin/users/all",
          },
        ],
      },
      {
        title: "Vagas",
        url: "/dashboard/admin/jobs",
        ref: "jobs",
        icon: Briefcase,
        isActive: false,
        items: [
          {
            title: "Vagas curadas",
            url: "/dashboard/admin/jobs/curated",
          },
          {
            title: "Curadoria de vagas",
            url: "/dashboard/admin/jobs/curation",
          },
          {
            title: "Vagas arquivadas",
            url: "/dashboard/admin/jobs/archives",
          },
        ],
      },
    ],
    classRooms: classrooms
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((classroom) => ({
        title: classroom.name,
        ref: classroom.id,
        url: `/dashboard/admin/classrooms/${classroom.id}`,
        icon: classroomPeriodsIcons[
          classroom.period as keyof typeof classroomPeriodsIcons
        ],
        isActive: false,
        items: [
          {
            title: "Projetos",
            url: `/dashboard/admin/classrooms/${classroom.id}/projects`,
          },
          {
            title: "⬆️ Coodesh",
            url: `/dashboard/admin/classrooms/${classroom.id}/coodesh`,
          },
          {
            title: "⬆️ Zoom",
            url: `/dashboard/admin/classrooms/${classroom.id}/zoom`,
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
    meetings.forEach((meeting) => (zoomMeetings[meeting._id] = meeting.topic));
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
