"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingComponent from "@/components/loading-component";

import { AuthUser } from "@supabase/supabase-js";
import { deleteJob, getAllJobs, updateJob } from "@/app/actions/jobs";
import { getAllProfiles, getProfileById } from "@/app/actions/profiles";

import { JobType } from "@/types/jobs";
import { AuthUserWithProfileType, RolesType } from "@/types/auth";
import {
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "@/app/actions/auth_admin";
import axios from "axios";
import {
  deleteUserRoleWithUserId,
  insertUserRoleWithUserId,
  updateUserRoleWIthUserId,
} from "@/app/actions/roles";

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
  jobsStack: {
    jobs: JobType[];
    setLoading: (loading: boolean) => void;
    handleInsertNewJob: (job: JobType) => void;
    handleUpdateJob: (job: JobType) => void;
    handleDeleteJob: (id: string | null) => Promise<void>;
    handleCurateJob: (jobId: string | null) => Promise<void>;
    handleResendJobToCuration: (jobId: string | null) => Promise<void>;
    handleArchiveJob: (jobId: string | null) => Promise<void>;
  };
  loading: boolean;
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
  jobsStack: {
    jobs: [],
    setLoading: () => {},
    handleInsertNewJob: () => {},
    handleUpdateJob: () => {},
    handleDeleteJob: () => Promise.resolve() as Promise<void>,
    handleCurateJob: () => Promise.resolve() as Promise<void>,
    handleResendJobToCuration: () => Promise.resolve() as Promise<void>,
    handleArchiveJob: () => Promise.resolve() as Promise<void>,
  },
  loading: true,
});

export const AdminStackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [users, setUsers] = useState<Partial<AuthUserWithProfileType>[]>([]);
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

        const jobsResponse = await getAllJobs();
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

  // Jobs
  const handleInsertNewJob = (newJob: JobType) => {
    setJobs((jobs) => [...jobs, newJob]);
  };

  const handleUpdateJob = (newJob: JobType) => {
    const updatedJobs = jobs.map((job) =>
      job.id === newJob.id ? newJob : job
    );
    setJobs(updatedJobs);
  };

  const handleCurateJob = async (jobId: string | null) => {
    try {
      if (!jobId) throw new Error("Invalid job ID");
      const data = {
        jobId: jobId,
        updates: {
          curated: true,
        },
      };

      const response = await axios.put(`/api/jobs`, data);
      if (response.status === 200) {
        const filteredProfiles = jobs.map((job) =>
          job.id === jobId ? { ...job, curated: true } : job
        );
        setJobs(filteredProfiles);

        toast.success("Vaga aprovada com sucesso!");
      }
    } catch (error) {
      console.error("Error to curate job:", error);
      toast.error("Erro ao aprovar a vaga.");
    }
  };

  const handleResendJobToCuration = async (jobId: string | null) => {
    try {
      if (!jobId) throw new Error("Invalid job ID");
      const data = {
        jobId: jobId,
        updates: {
          curated: false,
        },
      };

      const response = await axios.put(`/api/jobs`, data);
      if (response.status === 200) {
        const filteredProfiles = jobs.map((job) =>
          job.id === jobId ? { ...job, curated: false } : job
        );
        setJobs(filteredProfiles);

        toast.success("Vaga reenviada para curadoria com sucesso!");
      }
    } catch (error) {
      console.error("Error resend to curation job:", error);
      toast.error("Erro ao reenviar a vaga para a curadoria.");
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

      const filteredProfiles = jobs.map((job) =>
        job.id === jobId ? { ...job, curated: false, is_archived: true } : job
      );
      setJobs(filteredProfiles);

      toast.success("Vaga arquivada com sucesso!");
    } catch (error) {
      console.error("Error to curate job:", error);
      toast.error("Erro ao arquivar a vaga.");
    }
  };

  const handleDeleteJob = async (jobId: string | null) => {
    try {
      if (!jobId) throw new Error("Invalid job ID");

      const response = await deleteJob(jobId);

      if (!response) throw new Error("no delete job response");

      setJobs((jobs) => jobs.filter((job) => job.id !== jobId));
      toast.success("Vaga deletada com sucesso!");
    } catch (error) {
      console.log(error);
      toast.error("Erro ao deletar vaga. tente novamente mais tarde!");
    }
  };

  if (loading) {
    return <LoadingComponent />;
  }

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
        jobsStack: {
          jobs,
          setLoading,
          handleInsertNewJob,
          handleUpdateJob,
          handleDeleteJob,
          handleCurateJob,
          handleResendJobToCuration,
          handleArchiveJob,
        },
        loading,
      }}
    >
      {children}
    </AdminStackContext.Provider>
  );
};

export const useAdminStackContext = () => useContext(AdminStackContext);
