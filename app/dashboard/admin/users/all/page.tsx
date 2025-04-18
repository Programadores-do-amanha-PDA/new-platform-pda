"use client";
import ProfilesDataTable from "@/components/users/profiles-data-table";
import { useAdminStackContext } from "@/context/admin/stack-context";

export default function AllUsersPage() {
  const {
    usersStack: {
      users,
      handleDeleteUser,
      handleCreateNewUser,
      handleUpdateUser,
    },
    userRoleStack: {
      handleAddUserRole,
      handleDeleteUserRole,
      handleUpdateUserRole,
    },
    loading,
  } = useAdminStackContext();

  return (
    <main className="relative w-full overflow-hidden flex flex-col p-4 gap-4">
      <ProfilesDataTable
        users={users}
        handleCreateNewUser={handleCreateNewUser}
        handleUpdateUser={handleUpdateUser}
        handleDeleteUser={handleDeleteUser}
        handleAddUserRole={handleAddUserRole}
        handleDeleteUserRole={handleDeleteUserRole}
        handleUpdateUserRole={handleUpdateUserRole}
        loading={loading}
      />
    </main>
  );
}
