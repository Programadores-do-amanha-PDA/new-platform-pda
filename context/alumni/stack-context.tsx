"use client";
import { createContext, useContext } from "react";

import { AuthUserWithProfileType, RolesType } from "@/types/auth";
import useJobApplicationsStack, {
  useJobApplicationsStackI,
} from "../modules/jobs/applications";
import JobsStack, { JobsStackAlumniI } from "../modules/jobs";
import useResumesStack, { useResumesStackAlumniI } from "../modules/resume";
import { AppSidebar } from "@/components/common/sidebar/app-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, FileUser } from "lucide-react";
import AppBar from "@/components/common/app-bar";
import pathLabels from "@/utils/path-labels";

interface AlumniStackContextProps {
  jobsStack: JobsStackAlumniI;

  jobApplicationStack: Omit<
    useJobApplicationsStackI,
    "handleGetAllJobsApplications"
  >;

  resumeStack: useResumesStackAlumniI;
}

const AlumniStackContext = createContext<AlumniStackContextProps>(
  {} as AlumniStackContextProps
);

export const AlumniStackProvider = ({
  children,
  user,
  userRole,
}: {
  children: React.ReactNode;
  user: AuthUserWithProfileType;
  userRole: RolesType;
}) => {
  const { jobs, jobsLoading, handleGetAllCuratedJobs } = JobsStack();

  const {
    jobApplications,
    jobsApplicationLoading,
    handleGetAllJobsApplicationsByUserId,
    handleCreateJobApplication,
    handleUpdateJobApplicationStatus,
    handleDeleteJobApplication,
  } = useJobApplicationsStack();

  const {
    resumes,
    resumesLoading,
    handleGetResumeByUserId,
    handleCreateResume,
    handleUpdateResume,
    handleDeleteResume,
  } = useResumesStack();

  const data = {
    user: user,
    team: {
      name: "Empregabilidade Já",
      logo: () => (
        <Avatar className="size-8">
          <AvatarImage src="/assets/logos/simbolo_pda_fundo_branco.png" />
          <AvatarFallback>PdA</AvatarFallback>
        </Avatar>
      ),
    },
    userRole: userRole,
    navMain: [
      {
        title: "Vagas",
        url: "/dashboard/alumni/jobs",
        icon: Briefcase,
        items: [
          {
            title: "Todas as vagas",
            url: "/dashboard/alumni/jobs/all",
          },
          {
            title: "Realizar match",
            url: "/dashboard/alumni/jobs/match",
          },
          {
            title: "Minhas candidaturas",
            url: "/dashboard/alumni/jobs/applications",
          },
        ],
      },
    ],
    projects: [
      {
        name: "Meu currículo",
        url: "/dashboard/alumni/resume",
        icon: FileUser,
      },
    ],
  };

  const alumniPathLabels = () => {
    return {
      ...pathLabels,
    };
  };
  return (
    <AlumniStackContext.Provider
      value={{
        jobsStack: {
          jobs,
          jobsLoading,
          handleGetAllCuratedJobs,
        },
        jobApplicationStack: {
          jobApplications,
          jobsApplicationLoading,
          handleGetAllJobsApplicationsByUserId,
          handleCreateJobApplication,
          handleUpdateJobApplicationStatus,
          handleDeleteJobApplication,
        },
        resumeStack: {
          resumes,
          resumesLoading,
          handleGetResumeByUserId,
          handleCreateResume,
          handleDeleteResume,
          handleUpdateResume,
        },
      }}
    >
      <AppSidebar data={data} />
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        <AppBar pathLabels={alumniPathLabels()} />
        <div className="w-full h-full flex flex-col gap-10 overflow-hidden">
          {children}
        </div>
      </div>
    </AlumniStackContext.Provider>
  );
};

export const useAlumniStack = () => useContext(AlumniStackContext);
