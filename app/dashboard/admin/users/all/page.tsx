"use client";
import ProfilesDataTable from "@/components/users/profiles-data-table";
import { AppBar } from "@/components/app-bar";
import { useAdminStackContext } from "@/context/admin/admin-stack-context";

export default function AllUsersPage() {
  const {
    usersStack: {
      users,
      handleDeleteUser,
      handleInsertNewUser,
      handleUpdateUser,
    },
    loading,
  } = useAdminStackContext();

  return (
    <main className="relative w-full flex flex-col p-6 gap-4 xl:p-8">
      <AppBar />

      <div className="space-y-2">
        <ProfilesDataTable
          users={users}
          handleInsertNewUser={handleInsertNewUser}
          handleUpdateUser={handleUpdateUser}
          handleDeleteUser={handleDeleteUser}
          loading={loading}
        />
      </div>
    </main>
  );
}
