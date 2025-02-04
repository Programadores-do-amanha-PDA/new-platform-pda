"use client";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import LoadingComponent from "@/components/loading-component";
import { JobType } from "@/types/jobs";
import { AuthUserWithProfileType } from "@/types/auth";

interface AdminStackContextProps {
  usersStack: {
    users: AuthUserWithProfileType[];
    handleInsertNewUser: (user: AuthUserWithProfileType) => void;
    handleUpdateUser: (
      userID: string | undefined,
      user: AuthUserWithProfileType
    ) => void;
    handleDeleteUser: (userId: string | undefined) => void;
  };
  jobsStack: {
    jobs: JobType[];
    setLoading: (loading: boolean) => void;
    handleInsertNewJob: (job: JobType) => void;
    handleUpdateJob: (job: JobType) => void;
    handleDeleteJob: (id: string | null) => Promise<void>;
    handleCurateJob: (jobId: string | null) => Promise<void>;
    handleResendJobToCuration: (jobId: string | null) => Promise<void>;
  };
  loading: boolean;
}

const AdminStackContext = createContext<AdminStackContextProps>({
  usersStack: {
    users: [],
    handleInsertNewUser: () => {},
    handleUpdateUser: () => {},
    handleDeleteUser: () => {},
  },
  jobsStack: {
    jobs: [],
    setLoading: () => {},
    handleInsertNewJob: () => {},
    handleUpdateJob: () => {},
    handleDeleteJob: () => Promise.resolve() as Promise<void>,
    handleCurateJob: () => Promise.resolve() as Promise<void>,
    handleResendJobToCuration: () => Promise.resolve() as Promise<void>,
  },
  loading: true,
});

export const AdminStackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [users, setUsers] = useState<AuthUserWithProfileType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const usersResponse = await axios.get("/api/users");
        if (usersResponse.status !== 200)
          throw "no GET /api/users returned a status 200";
        setUsers(usersResponse.data.results);

        const jobResponse = await axios.get("/api/jobs");
        if (jobResponse.status !== 200)
          throw "no GET /api/job returned a status 200";
        setJobs(jobResponse.data.results);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Users
  const handleUpdateUser = (
    userID: string | undefined,
    userUpdated: AuthUserWithProfileType
  ) => {
    setUsers((users) =>
      users.map((user) => (user.id === userID ? { ...userUpdated } : user))
    );
  };

  const handleInsertNewUser = (newUser: AuthUserWithProfileType) => {
    const isUserExist = users.map((user) => user.id).includes(newUser.id);
    if (!isUserExist) {
      setUsers((users) => [...users, newUser]);
    }
  };

  const handleDeleteUser = async (userId: string | undefined) => {
    try {
      if (!userId) throw "user id is required to delete";

      const isUserExist = users.map((user) => user.id).includes(userId);
      const response = await axios.delete(`/api/auth_users?id=${userId}`);
      if (response.status !== 200) throw "no DELETE /api/auth_users response";

      if (isUserExist) {
        setUsers((users) => users.filter((user) => user.id !== userId));
      }
    } catch (error) {
      console.log(error);
      toast.error("Erro ao deletar usuário. tente novamente mais tarde!");
    }
  };

  // Jobs
  const handleDeleteJob = async (jobId: string | null) => {
    try {
      if (!jobId) throw new Error("Invalid job ID");
      const response = await axios.delete(`/api/jobs?id=${jobId}`);
      if (response.status === 200) {
        toast.success("Vaga deletada com sucesso!");
        const filteredProfiles = jobs.filter((job) => job.id !== jobId);
        setJobs(filteredProfiles);
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Erro ao deletar a vaga");
    }
  };

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

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <AdminStackContext.Provider
      value={{
        usersStack: {
          users,
          handleUpdateUser,
          handleInsertNewUser,
          handleDeleteUser,
        },
        jobsStack: {
          jobs,
          setLoading,
          handleInsertNewJob,
          handleUpdateJob,
          handleDeleteJob,
          handleCurateJob,
          handleResendJobToCuration,
        },
        loading,
      }}
    >
      {children}
    </AdminStackContext.Provider>
  );
};

export const useAdminStackContext = () => useContext(AdminStackContext);
