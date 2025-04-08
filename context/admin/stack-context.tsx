"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Briefcase, Moon, Sun, Sunrise, Users } from "lucide-react";

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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import LoadingComponent from "@/components/loading-component";

import { AuthUserWithProfileType } from "@/types/auth";
import { AppBar } from "@/components/app-bar";
import useZoomMeetingsStack, {
  ZoomMeetingsStackI,
} from "../modules/classrooms/zoom/meetings";
import useZoomAPIMeetingsStack, {
  ZoomAPIMeetingsStackI,
} from "../modules/classrooms/zoom/api";
import useZoomAccountsStack, {
  ZoomAccountsStackI,
} from "../modules/classrooms/zoom/accounts";

interface AdminStackContextProps {
  usersStack: UsersStackI;
  userRoleStack: UserRolesStackI;
  classroomsStack: ClassroomStackI & {
    coodesh: CoodeshAssessmentI & {
      api: CoodeshAPIAssessmentsI;
    };
    zoom: {
      accounts: ZoomAccountsStackI;
      meetings: ZoomMeetingsStackI;
      api: ZoomAPIMeetingsStackI;
    };
  };
  jobsStack: JobsStackI;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const AdminStackContext = createContext<AdminStackContextProps>({
  usersStack: {
    users: [],
    usersLoading: false,
    handleGetAllUsersWithProfiles: () => Promise.resolve(false),
    handleCreateNewUser: () => Promise.resolve(false),
    handleUpdateUser: () => Promise.resolve(false),
    handleDeleteUser: () => Promise.resolve(false),
  },
  userRoleStack: {
    handleAddUserRole: () => Promise.resolve(false),
    handleUpdateUserRole: () => Promise.resolve(false),
    handleDeleteUserRole: () => Promise.resolve(false),
  },
  classroomsStack: {
    classrooms: [],
    classroomsLoading: false,
    handleGetAllClassrooms: () => Promise.resolve(false),
    handleCreateClassroom: () => Promise.resolve(false),
    handleUpdateClassroom: () => Promise.resolve(false),
    handleDeleteClassroom: () => Promise.resolve(false),
    coodesh: {
      handleCreateCoodeshAssessment: () => Promise.resolve(false),
      handleUpdateCoodeshAssessment: () => Promise.resolve(false),
      api: {
        coodeshAPIAssessments: [],
        handleGetCoodeshAPIAssessments: () => Promise.resolve(false),
      },
    },
    zoom: {
      accounts: {
        accounts: [],
        accountsLoading: false,
        handleGetAllZoomAccounts: () => Promise.resolve(false),
        handleGetZoomAccountById: () => Promise.resolve(false),
        handleCreateZoomAccount: () => Promise.resolve(false),
        handleUpdateZoomAccountById: () => Promise.resolve(false),
        handleDeleteZoomAccountById: () => Promise.resolve(false),
      },
      meetings: {
        meetings: [],
        meetingsLoading: false,
        handleGetAllZoomMeetings: () => Promise.resolve(false),
        handleGetZoomMeetingById: () => Promise.resolve(false),
        handleCreateZoomMeeting: () => Promise.resolve(false),
        handleUpdateZoomMeeting: () => Promise.resolve(false),
        handleRefreshAndUpdateZoomMeeting: () => Promise.resolve(false),
        handleUpdateZoomMeetingOccurrence: () => Promise.resolve(false),
        handleUpdateZoomMeetingPastInstance: () => Promise.resolve(false),
        handleDeleteZoomMeeting: () => Promise.resolve(false),
      },
      api: {
        meetingsByAPI: [],
        meetingsByAPILoading: false,
        handleGetZoomMeAccountDataByAPI: () => Promise.resolve(false),
        handleGetAllZoomMeetingsByAPI: () => Promise.resolve(false),
        handleGetZoomMeetingByAPI: () => Promise.resolve(null),
        handleGetAllParticipantsByMeetingIdFromAPI: () => Promise.resolve([]),
        handleGetAllPollResultsByMeetingIdFromAPI: () => Promise.resolve([]),
      },
    },
  },
  jobsStack: {
    jobs: [],
    jobsLoading: false,
    handleGetAllJobs: () => Promise.resolve(false),
    handleCreateJob: () => Promise.resolve(false),
    handleUpdateJob: () => Promise.resolve(false),
    handleDeleteJob: () => Promise.resolve(false),
    handleCurateJob: () => Promise.resolve(false),
    handleResendJobToCuration: () => Promise.resolve(false),
    handleArchiveJob: () => Promise.resolve(false),
    handleJobIsOnDiscord: () => Promise.resolve(false),
  },
  loading: true,
  setLoading: () => {},
});

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
    setClassrooms,
    classroomsLoading,
    handleGetAllClassrooms,
    handleCreateClassroom,
    handleUpdateClassroom,
    handleDeleteClassroom,
  } = ClassroomStack();

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
  const { handleCreateCoodeshAssessment, handleUpdateCoodeshAssessment } =
    CoodeshAssessmentsStack(setClassrooms);

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

  // Zoom Meetings
  const {
    meetings,
    meetingsLoading,
    handleGetZoomMeetingById,
    handleGetAllZoomMeetings,
    handleCreateZoomMeeting,
    handleUpdateZoomMeeting,
    handleUpdateZoomMeetingOccurrence,
    handleUpdateZoomMeetingPastInstance,
    handleRefreshAndUpdateZoomMeeting,
    handleDeleteZoomMeeting,
  } = useZoomMeetingsStack({
    handleGetZoomMeetingByAPI,
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
        icon: Briefcase,
        isActive: true,
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
    classRooms: classrooms.flatMap((classroom) => ({
      title: classroom.name,
      url: `/dashboard/admin/classrooms/${classroom.id}`,
      icon: classroomPeriodsIcons[classroom.period],
      isActive: true,
      items: [
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
          coodesh: {
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
              handleUpdateZoomMeetingPastInstance,
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
      <AppSidebar loading={loading} data={sidebarData} />
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        <AppBar />
        <div className="w-full h-full flex flex-col gap-10 overflow-hidden px-4">
          {children}
        </div>
      </div>
    </AdminStackContext.Provider>
  );
};

export const useAdminStackContext = () => useContext(AdminStackContext);
