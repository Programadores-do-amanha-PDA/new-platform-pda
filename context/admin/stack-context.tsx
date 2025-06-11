"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Briefcase, Moon, Sun, Sunrise, Users } from "lucide-react";

import { AppSidebar } from "@/components/common/sidebar/app-sidebar";
import LoadingComponent from "@/components/common/loading-component";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppBar from "@/components/common/app-bar";

import pathLabels from "@/utils/path-labels";

import UsersStack, { UsersStackI } from "../modules/users";
import UserRolesStack, { UserRolesStackI } from "../modules/users/roles";
import JobsStack, { JobsStackI } from "../modules/jobs";
import ClassroomStack, { ClassroomStackI } from "../modules/classrooms";
import CoodeshAssessmentsStack, {
  CoodeshAssessmentI,
} from "../modules/classrooms/coodesh/assessments";
import CoodeshAPIAssessmentsStack, {
  CoodeshAPIAssessmentsI,
} from "../modules/classrooms/coodesh/api";
import useZoomMeetingsStack, {
  ZoomMeetingsStackI,
} from "../modules/classrooms/zoom/meetings";
import useZoomAPIMeetingsStack, {
  ZoomAPIMeetingsStackI,
} from "../modules/classrooms/zoom/api";
import useZoomAccountsStack, {
  ZoomAccountsStackI,
} from "../modules/classrooms/zoom/accounts";
import useClassroomProjects, {
  ClassroomProjectsI,
} from "../modules/classrooms/projects";

import UserClassroomStack, {
  UserClassroomStackI,
} from "../modules/users/classrooms";
import useZoomPastInstancesStack, {
  ZoomPastInstancesStackI,
} from "../modules/classrooms/zoom/meeting-past-instancies";

import { AuthUserWithProfileType } from "@/types/auth";
interface AdminStackContextProps {
  usersStack: UsersStackI;
  userRoleStack: UserRolesStackI;
  classroomsStack: ClassroomStackI & {
    projects: ClassroomProjectsI;
    coodesh: CoodeshAssessmentI & {
      api: CoodeshAPIAssessmentsI;
    };
    zoom: {
      accounts: ZoomAccountsStackI;
      meetings: ZoomMeetingsStackI & { pastInstances: ZoomPastInstancesStackI };
      api: ZoomAPIMeetingsStackI;
    };
    users: UserClassroomStackI;
  };
  jobsStack: JobsStackI;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const AdminStackContext = createContext<AdminStackContextProps>(
  {} as AdminStackContextProps
);

export const AdminStackProvider = ({
  children,
  user,
  userRole,
}: {
  children: React.ReactNode;
  user: AuthUserWithProfileType;
  userRole: string;
}) => {
  const [loading, setLoading] = useState(false);

  // Users
  const {
    users,
    setUsers,
    usersLoading,
    handleCreateNewUser,
    handleDeleteUser,
    handleUpdateUser,
    handleGetAllUsersWithProfiles,
  } = UsersStack();

  // User_Roles
  const { handleAddUserRole, handleUpdateUserRole, handleDeleteUserRole } =
    UserRolesStack(setUsers);

  // Classrooms
  const {
    classrooms,
    classroomsLoading,
    handleGetAllClassrooms,
    handleCreateClassroom,
    handleUpdateClassroom,
    handleDeleteClassroom,
  } = ClassroomStack();

  // User classrooms
  const { handleInsertUserClassrooms, handleDeleteUserClassroom } =
    UserClassroomStack(setUsers);

  // Projects
  const {
    projects,
    projectsLoading,
    handleGetAllProjectsByClassroomId,
    handleGetAllProjectsWithDeliveriesAndCorrectionsByClassroomId,
    handleCreateClassroomProject,
    handleUpdateClassroomProject,
    handleDeleteProject,
  } = useClassroomProjects();

  // Jobs
  const {
    jobs,
    jobsLoading,
    handleGetAllJobs,
    handleCreateJob,
    handleUpdateJob,
    handleDeleteJob,
    handleCurateJob,
    handleResendJobToCuration,
    handleArchiveJob,
    handleJobIsOnDiscord,
  } = JobsStack();

  // Coodesh
  const {
    assessments,
    assessmentsLoading,
    handleGetAllCoodeshAssessmentByClassroomId,
    handleCreateCoodeshAssessment,
    handleUpdateCoodeshAssessment,
  } = CoodeshAssessmentsStack();

  // Coodesh API
  const { coodeshAPIAssessments, handleGetCoodeshAPIAssessments } =
    CoodeshAPIAssessmentsStack();

  // Zoom API
  const {
    meetingsByAPI,
    meetingsByAPILoading,
    handleGetZoomMeAccountDataByAPI,
    handleGetAllZoomMeetingsByAPI,
    handleGetZoomMeetingByAPI,
    handleGetAllParticipantsByMeetingIdFromAPI,
    handleGetAllPollResultsByMeetingIdFromAPI,
  } = useZoomAPIMeetingsStack();

  // Zoom Accounts
  const {
    accounts,
    accountsLoading,
    handleGetAllZoomAccounts,
    handleGetZoomAccountById,
    handleCreateZoomAccount,
    handleUpdateZoomAccountById,
    handleDeleteZoomAccountById,
  } = useZoomAccountsStack(handleGetZoomMeAccountDataByAPI);

  const {
    pastInstances,
    pastInstancesLoading,
    handleCreateZoomPastInstance,
    handleCreateManyZoomPastInstance,
    handleGetZoomPastInstanceById,
    handleGetAllZoomPastInstances,
    handleUpdateZoomPastInstance,
    handleDeleteZoomPastInstance,
  } = useZoomPastInstancesStack();

  // Zoom Meetings
  const {
    meetings,
    meetingsLoading,
    handleGetZoomMeetingById,
    handleGetAllZoomMeetings,
    handleCreateZoomMeeting,
    handleUpdateZoomMeeting,
    handleUpdateZoomMeetingOccurrence,
    handleRefreshAndUpdateZoomMeeting,
    handleDeleteZoomMeeting,
  } = useZoomMeetingsStack({
    handleGetZoomMeetingByAPI,
    pastInstances,
    handleCreateManyZoomPastInstance,
    handleUpdateZoomPastInstance
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await handleGetAllClassrooms();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingComponent />;
  }

  const classroomPeriodsIcons = {
    morning: Sunrise,
    afternoon: Sun,
    evening: Moon,
  };

  const sidebarData = {
    user: user,
    userRole: userRole,
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
      .flatMap((classroom) => ({
        title: classroom.name,
        ref: classroom.id,
        url: `/dashboard/admin/classrooms/${classroom.id}`,
        icon: classroomPeriodsIcons[classroom.period],
        isActive: false,
        items: [
                    {
            title: "Presenças",
            url: `/dashboard/admin/classrooms/${classroom.id}/attendance`,
          },
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

  const adminPathLabels = () => {
    const classroomLabels: Record<string, string> = {};
    const ZoomMeetings: Record<string, string> = {};
    const CoodeshAssesments: Record<string, string> = {};
    const ClassroomProjects: Record<string, string> = {};

    if (classrooms.length > 0) {
      classrooms.forEach(
        (classroom) => (classroomLabels[classroom.id] = classroom.name)
      );
    }

    if (meetings.length > 0) {
      meetings.forEach((meeting) => (ZoomMeetings[meeting.id] = meeting.topic));
    }
    if (assessments.length > 0) {
      assessments.forEach((assessment) => {
        if (assessment.id && assessment.name) {
          CoodeshAssesments[assessment.id] = assessment.name;
        }
      });
    }

    if (projects.length > 0) {
      projects.forEach(
        (project) => (ClassroomProjects[project.id] = project.title)
      );
    }

    return {
      ...pathLabels,
      ...classroomLabels,
      ...ZoomMeetings,
      ...CoodeshAssesments,
      ...ClassroomProjects,
    };
  };

  return (
    <AdminStackContext.Provider
      value={{
        usersStack: {
          users,
          usersLoading,
          handleGetAllUsersWithProfiles,
          handleCreateNewUser,
          handleUpdateUser,
          handleDeleteUser,
        },
        userRoleStack: {
          handleAddUserRole,
          handleUpdateUserRole,
          handleDeleteUserRole,
        },
        classroomsStack: {
          classrooms,
          classroomsLoading,
          handleGetAllClassrooms,
          handleCreateClassroom,
          handleUpdateClassroom,
          handleDeleteClassroom,
          projects: {
            projects,
            projectsLoading,
            handleGetAllProjectsByClassroomId,
            handleGetAllProjectsWithDeliveriesAndCorrectionsByClassroomId,
            handleCreateClassroomProject,
            handleUpdateClassroomProject,
            handleDeleteProject,
          },
          coodesh: {
            assessments,
            assessmentsLoading,
            handleGetAllCoodeshAssessmentByClassroomId,
            handleCreateCoodeshAssessment,
            handleUpdateCoodeshAssessment,
            api: {
              coodeshAPIAssessments,
              handleGetCoodeshAPIAssessments,
            },
          },
          zoom: {
            accounts: {
              accounts,
              accountsLoading,
              handleGetAllZoomAccounts,
              handleGetZoomAccountById,
              handleCreateZoomAccount,
              handleUpdateZoomAccountById,
              handleDeleteZoomAccountById,
            },
            meetings: {
              meetings,
              meetingsLoading,
              handleGetZoomMeetingById,
              handleGetAllZoomMeetings,
              handleCreateZoomMeeting,
              handleUpdateZoomMeeting,
              handleDeleteZoomMeeting,
              handleRefreshAndUpdateZoomMeeting,
              handleUpdateZoomMeetingOccurrence,
              pastInstances: {
                pastInstances,
                pastInstancesLoading,
                handleGetZoomPastInstanceById,
                handleGetAllZoomPastInstances,
                handleCreateZoomPastInstance,
                handleUpdateZoomPastInstance,
                handleDeleteZoomPastInstance,
              },
            },

            api: {
              meetingsByAPI,
              meetingsByAPILoading,
              handleGetZoomMeAccountDataByAPI,
              handleGetAllZoomMeetingsByAPI,
              handleGetZoomMeetingByAPI,
              handleGetAllParticipantsByMeetingIdFromAPI,
              handleGetAllPollResultsByMeetingIdFromAPI,
            },
          },
          users: {
            handleInsertUserClassrooms,
            handleDeleteUserClassroom,
          },
        },
        jobsStack: {
          jobs,
          jobsLoading,
          handleGetAllJobs,
          handleCreateJob,
          handleUpdateJob,
          handleDeleteJob,
          handleCurateJob,
          handleResendJobToCuration,
          handleArchiveJob,
          handleJobIsOnDiscord,
        },
        loading,
        setLoading,
      }}
    >
      <AppSidebar data={sidebarData} />
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        <AppBar pathLabels={adminPathLabels()} />
        <div className="w-full h-full flex flex-col gap-10 overflow-hidden">
          {children}
        </div>
      </div>
    </AdminStackContext.Provider>
  );
};

export const useAdminStackContext = () => useContext(AdminStackContext);
