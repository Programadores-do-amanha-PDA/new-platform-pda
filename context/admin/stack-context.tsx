"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingComponent from "@/components/loading-component";

import { AuthUser } from "@supabase/supabase-js";
import {
  createJob,
  deleteJob,
  getAllJobsWithApplications,
  updateJob,
} from "@/app/actions/jobs";
import { getAllProfiles, getProfileById } from "@/app/actions/profiles";

import { JobType, JobWithApplications } from "@/types/jobs";
import { AuthUserWithProfileType, RolesType } from "@/types/auth";
import {
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "@/app/actions/auth_admin";
import {
  deleteUserRoleWithUserId,
  insertUserRoleWithUserId,
  updateUserRoleWIthUserId,
} from "@/app/actions/roles";
import { TeamPeriodsType, TeamType } from "@/types/teams";
import {
  createTeam,
  deleteTeam,
  getAllTeams,
  updateTeam,
} from "@/app/actions/team";

import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Book, Briefcase, Users } from "lucide-react";
import { createTeamCoodeshAssessment } from "@/app/actions/team/coodesh";
import { AssessmentType, TeamCoodeshAssessments } from "@/types/assessments";
import { getCoodeshAPIAssessments } from "@/utils/coodesh-api";

interface AdminStackContextProps {
  usersStack: {
    users: Partial<AuthUserWithProfileType>[];
    handleCreateNewUser: (
      user: Partial<AuthUser & { password: string }>
    ) => Promise<string | false>;
    handleUpdateUser: (
      userID: string,
      user: Partial<AuthUser & { password: string }>
    ) => Promise<boolean>;
    handleDeleteUser: (userId: string) => Promise<boolean>;
  };
  userRoleStack: {
    handleAddUserRole: (userId: string, role: RolesType) => Promise<boolean>;
    handleUpdateUserRole: (userId: string, role: RolesType) => Promise<boolean>;
    handleDeleteUserRole: (userId: string) => Promise<boolean>;
  };
  teamsStack: {
    teams: TeamType[];
    handleCreateTeam: (teamData: {
      name: string;
      period: TeamPeriodsType;
    }) => Promise<boolean | string>;
    handleUpdateTeam: (
      teamId: string,
      updates: Partial<TeamType>
    ) => Promise<boolean>;
    handleDeleteTeam: (teamId: string) => Promise<boolean>;
    coodesh: {
      handleCreateTeamAssessment: (
        assessmentData: Partial<TeamCoodeshAssessments>
      ) => Promise<boolean>;
      api: {
        assessments: AssessmentType[];
        handleGetAssessments: () => Promise<boolean>;
      };
    };
  };
  jobsStack: {
    jobs: JobWithApplications[];
    handleCreateJob: (job: Partial<JobType>) => Promise<boolean>;
    handleUpdateJob: (jobId: string, job: Partial<JobType>) => Promise<boolean>;
    handleDeleteJob: (id: string) => Promise<boolean>;
    handleCurateJob: (jobId: string) => Promise<boolean>;
    handleResendJobToCuration: (jobId: string) => Promise<boolean>;
    handleArchiveJob: (jobId: string) => Promise<boolean>;
    handleJobIsOnDiscord: (jobId: string) => Promise<boolean>;
  };
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const AdminStackContext = createContext<AdminStackContextProps>({
  usersStack: {
    users: [],
    handleCreateNewUser: () => Promise.resolve(false),
    handleUpdateUser: () => Promise.resolve(false),
    handleDeleteUser: () => Promise.resolve(false),
  },
  userRoleStack: {
    handleAddUserRole: () => Promise.resolve(false),
    handleUpdateUserRole: () => Promise.resolve(false),
    handleDeleteUserRole: () => Promise.resolve(false),
  },
  teamsStack: {
    teams: [],
    handleCreateTeam: () => Promise.resolve(false),
    handleUpdateTeam: () => Promise.resolve(false),
    handleDeleteTeam: () => Promise.resolve(false),
    coodesh: {
      handleCreateTeamAssessment: () => Promise.resolve(false),
      api: {
        assessments: [],
        handleGetAssessments: () => Promise.resolve(false),
      },
    },
  },
  jobsStack: {
    jobs: [],
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
  const [users, setUsers] = useState<Partial<AuthUserWithProfileType>[]>([]);
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [coodeshAPIAssessment, setCoodeshAPIAssessment] = useState<
    AssessmentType[]
  >([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const usersResponse = await getAllUsers();
        if (!usersResponse) throw "no users response";

        const profilesResponse = await getAllProfiles();
        if (!profilesResponse) throw "no users profile response";

        const usersWithProfiles = usersResponse.map((user) => {
          const userProfile = profilesResponse.find(
            (profile) => profile.id === user.id
          );

          return {
            ...user,
            profile: userProfile,
          };
        });
        setUsers(usersWithProfiles);

        const teamsResponse = await getAllTeams();
        if (!teamsResponse) throw "no teams response";
        console.log(teamsResponse);
        setTeams(teamsResponse);

        const jobsResponse = await getAllJobsWithApplications();
        if (!jobsResponse) throw "no jobs response";
        setJobs(jobsResponse);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Users
  const handleCreateNewUser = async (
    userData: Partial<AuthUser & { password: string }>
  ) => {
    try {
      if (
        !userData.email ||
        !userData.password ||
        !userData.user_metadata ||
        !userData.user_metadata.full_name ||
        !userData.user_metadata.user_email
      ) {
        throw new Error("invalid user data");
      }

      const userResponse = await createUser(userData);
      if (!userResponse) throw new Error("no user response");

      const userProfileResponse = await getProfileById(userResponse.id);
      if (!userProfileResponse) throw new Error("no user profile response");

      setUsers((users) => [
        ...users,
        { ...userResponse, profile: userProfileResponse },
      ]);
      toast.success("Novo usuário criado com sucesso!");
      return userResponse.id;
    } catch (error) {
      toast.error("Erro ao criar novo usuário!");
      console.log(error);
      return false;
    }
  };

  const handleUpdateUser = async (
    userID: string | undefined,
    updates: Partial<AuthUser & { password: string }>
  ) => {
    try {
      if (!userID || !updates) {
        throw new Error("id and updates fields are required");
      }

      const userUpdatedResponse = await updateUser(userID, updates);
      if (!userUpdatedResponse) throw new Error("no update user response");

      setUsers((users) =>
        users.map((currentUser) => {
          if (currentUser.id === userID) {
            const userUpdatedData: AuthUserWithProfileType = {
              ...currentUser,
              ...userUpdatedResponse,
              profile: {
                ...currentUser.profile,
                email: userUpdatedResponse.user_metadata.user_email as string,
                full_name: userUpdatedResponse.user_metadata
                  .full_name as string,
              },
              user_metadata: {
                ...currentUser.user_metadata,
                ...userUpdatedResponse.user_metadata,
              },
            };

            return userUpdatedData;
          }
          return currentUser;
        })
      );
      toast.success("Usuário atualizado com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao atualizar o usuário!");
      return false;
    }
  };

  const handleDeleteUser = async (userId: string | undefined) => {
    try {
      if (!userId) throw new Error("user id is required to delete");

      const response = await deleteUser(userId);
      if (!response) throw new Error("no delete user response");

      setUsers((users) => users.filter((user) => user.id !== userId));
      toast.success("Usuário deletado com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao deletar usuário. tente novamente mais tarde!");
      return false;
    }
  };

  // User_Roles
  const handleAddUserRole = async (userId: string, role: RolesType) => {
    try {
      if (!userId || !role) {
        throw new Error("user id and role fields are required");
      }
      const response = await insertUserRoleWithUserId(userId, role);
      if (!response) throw new Error("no insert user role response");

      setUsers((users) =>
        users.map((user) =>
          user.id === userId && user.profile
            ? {
                ...user,
                profile: {
                  ...user.profile,
                  id: user.profile.id || "",
                  user_roles: [{ role: role }],
                },
              }
            : user
        )
      );
      toast.success("Cargo adicionado com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao adicionar cargo ao usuário!");
      return false;
    }
  };

  const handleUpdateUserRole = async (userId: string, role: RolesType) => {
    try {
      if (!userId || !role) {
        throw new Error("role and id fields are required");
      }
      const responseData = await updateUserRoleWIthUserId(userId, role);
      if (!responseData) {
        throw new Error("no update user role data was returned");
      }
      setUsers((users) =>
        users.map((user) =>
          user.id === userId && user.profile
            ? {
                ...user,
                profile: {
                  ...user.profile,
                  user_roles: [{ role }],
                },
              }
            : user
        )
      );
      toast.success("Cargo atualizado com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao atualizar cargo do usuário!");
      return false;
    }
  };

  const handleDeleteUserRole = async (userId: string) => {
    try {
      if (!userId) throw new Error("role and id fields are required");
      const responseData = await deleteUserRoleWithUserId(userId);
      if (!responseData)
        throw new Error("no update user role data was returned");

      setUsers((users) =>
        users.map((user) =>
          user.id === userId && user.profile
            ? {
                ...user,
                profile: {
                  ...user.profile,
                  user_roles: [],
                },
              }
            : user
        )
      );
      toast.success("Cargo removido com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao remover cargo do usuário!");
      return false;
    }
  };

  // Team
  const handleCreateTeam = async (teamData: {
    name: string;
    period: TeamPeriodsType;
  }) => {
    try {
      if (
        !teamData.name ||
        teamData.name.trim().length === 0 ||
        teams.map((t) => t.name).includes(teamData.name)
      ) {
        toast.error("Nome da turma é inválido ou já existe!");
        throw new Error("invalid team name");
      }

      if (!teamData.period) {
        toast.error("Período da turma é inválido!");
        throw new Error("invalid team period");
      }

      const newTeam = await createTeam(teamData);
      if (!newTeam) throw new Error("no team create response");

      setTeams((teams) => [...teams, { ...newTeam }]);
      toast.success(`Turma ${newTeam.name} criada com sucesso!`);
      return newTeam.id;
    } catch (error) {
      toast.error("Erro ao criar novo usuário!");
      console.log(error);
      return false;
    }
  };

  const handleUpdateTeam = async (
    teamId: string,
    updates: Partial<TeamType>
  ) => {
    try {
      if (!teamId || !updates) {
        throw new Error("id and updates fields are required");
      }

      const teamUpdated = await updateTeam(teamId, updates);
      if (!teamUpdated) throw new Error("no update team response");

      setTeams((teams) =>
        teams.map((team) => (team.id === teamId ? teamUpdated : team))
      );
      toast.success("Turma atualizada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao atualizar a turma!");
      return false;
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      if (!teamId) throw new Error("team id is required to delete");

      const response = await deleteTeam(teamId);
      if (!response) throw new Error("no delete team response");

      setTeams((teams) => teams.filter((team) => team.id !== teamId));
      toast.success("Turma deletada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao deletar turma. Tente novamente mais tarde!");
      return false;
    }
  };

  //  Team - Coodesh
  const handleCreateTeamAssessment = async (
    assessmentData: Partial<TeamCoodeshAssessments>
  ) => {
    try {
      if (!assessmentData.team_id || !assessmentData.assessment_id)
        throw new Error("required fields");

      const assessmentCreated = await createTeamCoodeshAssessment(
        assessmentData
      );
      if (!assessmentCreated)
        throw new Error("no assessment created successfully");

      setTeams((teams) =>
        teams.map((team) =>
          team.id === assessmentData.team_id
            ? {
                ...team,
                team_coodesh_assessments: team.team_coodesh_assessments
                  ? [...team.team_coodesh_assessments, assessmentCreated]
                  : [assessmentCreated],
              }
            : team
        )
      );
      toast.success("Avaliação anexada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao anexar a avaliação! Tente novamente mais tarde!");
      return false;
    }
  };

  const handleGetCoodeshAPIAssessments = async () => {
    try {
      const assessments = await getCoodeshAPIAssessments();
      if (!assessments) throw "no assessments fetched successfully";
      setCoodeshAPIAssessment(assessments.data);
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao buscar avaliações! Tente novamente mais tarde!");
      return false;
    }
  };

  // Jobs
  const handleCreateJob = async (newJob: Partial<JobType>) => {
    try {
      const jobCreated = await createJob(newJob);

      if (!jobCreated) throw "job is not created successfully";

      setJobs((jobs) => [...jobs, jobCreated]);
      toast.success("Sucesso ao criar a vaga!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao criar a vaga. Tente novamente mais tarde!");
      return false;
    }
  };

  const handleUpdateJob = async (jobId: string, updates: Partial<JobType>) => {
    try {
      const jobUpdated = await updateJob(jobId, updates);

      if (!jobUpdated) throw new Error("job is not updated successfully");

      setJobs((jobs) =>
        jobs.map((job) => (job.id === jobId ? jobUpdated : job))
      );
      toast.success("Sucesso ao editar vaga!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao editar vaga. Tente novamente mais tarde!");
      return false;
    }
  };

  const handleCurateJob = async (jobId: string) => {
    try {
      const jobUpdated = await updateJob(jobId, {
        curated: true,
        is_archived: false,
      });

      if (!jobUpdated) throw new Error("job is not updated successfully");

      setJobs((jobs) =>
        jobs.map((job) => (job.id === jobId ? jobUpdated : job))
      );

      toast.success("Vaga aprovada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao aprovar vaga. Tente novamente mais tarde!");
      return false;
    }
  };

  const handleResendJobToCuration = async (jobId: string) => {
    try {
      const jobUpdated = await updateJob(jobId, {
        curated: false,
        is_archived: false,
      });

      if (!jobUpdated) throw new Error("job is not updated successfully");

      setJobs((jobs) =>
        jobs.map((job) => (job.id === jobId ? jobUpdated : job))
      );

      toast.success("Vaga reenviada a curadoria com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error(
        "Erro ao reenviada vaga a curadoria. Tente novamente mais tarde!"
      );
      return false;
    }
  };

  const handleJobIsOnDiscord = async (jobId: string) => {
    try {
      const jobUpdated = await updateJob(jobId, {
        is_on_discord: true,
      });

      if (!jobUpdated) throw new Error("job is not updated successfully");

      setJobs((jobs) =>
        jobs.map((job) =>
          job.id === jobId ? { ...job, is_on_discord: true } : job
        )
      );

      toast.success("Vaga reenviada a curadoria com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error(
        "Erro ao reenviada vaga a curadoria. Tente novamente mais tarde!"
      );
      return false;
    }
  };

  const handleArchiveJob = async (jobId: string | null) => {
    try {
      if (!jobId) throw new Error("Invalid job ID");

      const response = await updateJob(jobId, {
        curated: false,
        is_archived: true,
      });
      if (!response) throw new Error("failed to update job");

      setJobs((jobs) =>
        jobs.map((job) =>
          job.id === jobId ? { ...job, curated: false, is_archived: true } : job
        )
      );

      toast.success("Vaga arquivada com sucesso!");
      return true;
    } catch (error) {
      console.error("Error to curate job:", error);
      toast.error("Erro ao arquivar a vaga.");
      return false;
    }
  };

  const handleDeleteJob = async (jobId: string | null) => {
    try {
      if (!jobId) throw new Error("Invalid job ID");

      const response = await deleteJob(jobId);

      if (!response) throw new Error("no delete job response");

      setJobs((jobs) => jobs.filter((job) => job.id !== jobId));
      toast.success("Vaga deletada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao deletar vaga. tente novamente mais tarde!");
      return false;
    }
  };

  if (loading) {
    return <LoadingComponent />;
  }

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
      {
        title: "Turmas",
        url: "/dashboard/admin/teams",
        icon: Book,
        isActive: true,
        items: teams.map((team) => ({
          title: team.name,
          url: `/dashboard/admin/teams/${team.id}`,
          items: [
            {
              title: "Coodesh",
              url: `/dashboard/admin/teams/${team.id}/coodesh`,
            },
          ],
        })),
      },
    ],
    projects: [],
  };

  return (
    <AdminStackContext.Provider
      value={{
        usersStack: {
          users,
          handleUpdateUser,
          handleCreateNewUser,
          handleDeleteUser,
        },
        userRoleStack: {
          handleAddUserRole,
          handleUpdateUserRole,
          handleDeleteUserRole,
        },
        teamsStack: {
          teams,
          handleCreateTeam,
          handleUpdateTeam,
          handleDeleteTeam,
          coodesh: {
            handleCreateTeamAssessment,
            api: {
              assessments: coodeshAPIAssessment,
              handleGetAssessments: handleGetCoodeshAPIAssessments,
            },
          },
        },
        jobsStack: {
          jobs,
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
      {children}
    </AdminStackContext.Provider>
  );
};

export const useAdminStackContext = () => useContext(AdminStackContext);
