"use client";
import { createContext, useContext } from "react";

import { AuthUserWithProfileType, RolesType } from "@/types/auth";
import UsersStack, { UsersStackI } from "../modules/users";
import UserRolesStack from "../modules/users/roles";
import JobsStack, { JobsStackI } from "../modules/jobs";
import { Briefcase, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppBar from "@/components/common/app-bar";
import pathLabels from "@/utils/path-labels";
import { AppSidebar } from "@/components/common/sidebar/app-sidebar";

interface EmployerStackContextProps {
  usersStack: UsersStackI;

  userRoleStack: {
    handleAddUserRole: (userId: string, role: RolesType) => Promise<boolean>;
    handleUpdateUserRole: (userId: string, role: RolesType) => Promise<boolean>;
    handleDeleteUserRole: (userId: string) => Promise<boolean>;
  };

  jobsStack: JobsStackI;
}

const EmployerStackContext = createContext<EmployerStackContextProps>(
  {} as EmployerStackContextProps
);

export const EmployerStackProvider = ({
  children,
  user,
  userRole,
}: {
  children: React.ReactNode;
  user: AuthUserWithProfileType;
  userRole: string;
}) => {
  // Alumni
  const {
    users,
    setUsers,
    usersLoading,
    handleCreateNewUser,
    handleGetAllUsersWithProfiles,
    handleUpdateUser,
    handleDeleteUser,
  } = UsersStack();

  // User_Roles
  const { handleAddUserRole, handleUpdateUserRole, handleDeleteUserRole } =
    UserRolesStack(setUsers);

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

  const employerPathLabels = () => {
    return {
      ...pathLabels,
    };
  };

  const path = "/dashboard/employer";

  const sidebarData = {
    user: user,
    userRole: userRole,
    team: {
      name: "Gerente de Empregabilidade",
      logo: () => (
        <Avatar className="size-8">
          <AvatarImage src="/assets/logos/simbolo_pda_fundo_branco.png" />
          <AvatarFallback>PdA</AvatarFallback>
        </Avatar>
      ),
    },
    navMain: [
      {
        title: "Alumni",
        url: `${path}/alumni`,
        ref: "users",
        icon: Users,
        items: [
          {
            title: "Todos os alumni",
            url: `${path}/alumni/all`,
          },
        ],
      },
      {
        title: "Vagas",
        url: `${path}/jobs`,
        ref: "jobs",
        icon: Briefcase,
        isActive: false,
        items: [
          {
            title: "Vagas curadas",
            url: `${path}/jobs/curated`,
          },
          {
            title: "Curadoria de vagas",
            url: `${path}/jobs/curation`,
          },
          {
            title: "Vagas arquivadas",
            url: `${path}/jobs/archives`,
          },
        ],
      },
    ],
    projects: [],
  };

  return (
    <EmployerStackContext.Provider
      value={{
        usersStack: {
          users,
          usersLoading,
          handleGetAllUsersWithProfiles,
          handleUpdateUser,
          handleCreateNewUser,
          handleDeleteUser,
        },
        userRoleStack: {
          handleAddUserRole,
          handleUpdateUserRole,
          handleDeleteUserRole,
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
      }}
    >
      <AppSidebar data={sidebarData} />
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        <AppBar pathLabels={employerPathLabels()} />
        <div className="w-full h-full flex flex-col gap-10 overflow-hidden">
          {children}
        </div>
      </div>
    </EmployerStackContext.Provider>
  );
};

export const useEmployerStack = () => useContext(EmployerStackContext);
