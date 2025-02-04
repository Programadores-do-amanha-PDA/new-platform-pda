"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthUserWithProfileType } from "@/types/auth";
import axios from "axios";
import { toast } from "sonner";
import LoadingComponent from "@/components/loading-component";

interface AdminDataContextProps {
  users: AuthUserWithProfileType[];
  usersLoading: boolean;
  setUsersLoading: (loading: boolean) => void;
  handleInsertNewUser: (user: AuthUserWithProfileType) => void;
  handleUpdateUser: (
    userID: string | undefined,
    user: AuthUserWithProfileType
  ) => void;
  handleDeleteUser: (userId: string | undefined) => void;
}

const AdminDataContext = createContext<AdminDataContextProps>({
  users: [],
  usersLoading: true,
  setUsersLoading: () => {},
  handleInsertNewUser: () => {},
  handleUpdateUser: () => {},
  handleDeleteUser: () => {},
});

export const AdminStackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [users, setUsers] = useState<AuthUserWithProfileType[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      setUsersLoading(true);
      try {
        const response = await axios.get("/api/users");
        if (response.status !== 200) throw "no GET /api/users response";
        setUsers(response.data.results);
      } catch (error) {
        console.error(error);
      }

      setUsersLoading(false);
    };

    fetchProfiles();
  }, []);

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

  if (usersLoading) {
    return <LoadingComponent />;
  }

  return (
    <AdminDataContext.Provider
      value={{
        users,
        usersLoading,
        setUsersLoading,
        handleUpdateUser,
        handleInsertNewUser,
        handleDeleteUser,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminStackContext = () => useContext(AdminDataContext);
