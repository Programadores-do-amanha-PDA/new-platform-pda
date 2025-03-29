"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingComponent from "@/components/loading-component";

import {
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "@/app/actions/auth_admin";
import { getProfileById } from "@/app/actions/profiles";
import {
  createJob,
  deleteJob,
  getAllJobsWithApplications,
  updateJob,
} from "@/app/actions/jobs";

import { AuthUser } from "@supabase/supabase-js";
import { JobType, JobWithApplications } from "@/types/jobs";
import { AuthUserWithProfileType, RolesType } from "@/types/auth";
import {
  deleteUserRoleWithUserId,
  insertUserRoleWithUserId,
  updateUserRoleWIthUserId,
} from "@/app/actions/roles";

interface EmployerStackContextProps {
  alumniStack: {
    alumni: AuthUserWithProfileType[];
    handleCreateNewAlumni: (
      user: Partial<AuthUser & { password: string }>
    ) => Promise<string | false>;
    handleUpdateAlumni: (
      userID: string,
      user: Partial<AuthUser & { password: string }>
    ) => Promise<boolean>;
    handleDeleteAlumni: (userId: string) => Promise<boolean>;
  };

  userRoleStack: {
    handleAddUserRole: (userId: string, role: RolesType) => Promise<boolean>;
    handleUpdateUserRole: (userId: string, role: RolesType) => Promise<boolean>;
    handleDeleteUserRole: (userId: string) => Promise<boolean>;
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
  setLoading: (loading: boolean) => void;
  loading: boolean;
}

const EmployerStackContext = createContext<EmployerStackContextProps>({
  alumniStack: {
    alumni: [],
    handleCreateNewAlumni: () => Promise.resolve(false),
    handleUpdateAlumni: () => Promise.resolve(false),
    handleDeleteAlumni: () => Promise.resolve(false),
  },

  userRoleStack: {
    handleAddUserRole: () => Promise.resolve(false),
    handleUpdateUserRole: () => Promise.resolve(false),
    handleDeleteUserRole: () => Promise.resolve(false),
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
  setLoading: () => {},
  loading: true,
});

export const EmployerStackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [alumni, setAlumni] = useState<AuthUserWithProfileType[]>([]);
  const [jobs, setJobs] = useState<JobWithApplications[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allAlumni = await getAllUsers("alumni");
        if (!allAlumni) throw "no get all alumni response";
        setAlumni(allAlumni);

        const jobResponse = await getAllJobsWithApplications();
        if (!jobResponse) throw "no get all jobs response";
        setJobs(jobResponse);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Alumni
  const handleUpdateAlumni = async (
    userID: string | undefined,
    updates: Partial<AuthUser & { password: string }>
  ) => {
    try {
      if (!userID || !updates) {
        throw new Error("id and updates fields are required");
      }

      const userUpdatedResponse = await updateUser(userID, updates);
      if (!userUpdatedResponse) throw new Error("no update user response");

      setAlumni((users) =>
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

  const handleCreateNewAlumni = async (
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

      setAlumni((users) => [
        ...users,
        { ...userResponse, profile: userProfileResponse },
      ]);
      toast.success("Novo alumni criado com sucesso!");
      return userResponse.id;
    } catch (error) {
      toast.error("Erro ao criar novo alumni!");
      console.log(error);
      return false;
    }
  };

  const handleDeleteAlumni = async (userId: string | undefined) => {
    try {
      if (!userId) throw new Error("user id is required to delete");

      const response = await deleteUser(userId);
      if (!response) throw new Error("no delete user response");

      setAlumni((users) => users.filter((user) => user.id !== userId));
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

      setAlumni((users) =>
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
      setAlumni((users) =>
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

      setAlumni((users) =>
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

  return (
    <EmployerStackContext.Provider
      value={{
        alumniStack: {
          alumni,
          handleUpdateAlumni,
          handleCreateNewAlumni,
          handleDeleteAlumni,
        },
        userRoleStack: {
          handleAddUserRole,
          handleUpdateUserRole,
          handleDeleteUserRole,
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
      {children}
    </EmployerStackContext.Provider>
  );
};

export const useEmployerStack = () => useContext(EmployerStackContext);
