"use client";
import ProfilesDataTable from "@/components/common/users/profiles-data-table";
import { useEmployerStack } from "@/context/employer/stack-context";

export default function AllUsersPage() {
  const {
    usersStack: {
      users,
      usersLoading,
      handleDeleteUser,
      handleCreateNewUser,
      handleUpdateUser,
    },
    userRoleStack: {
      handleAddUserRole,
      handleDeleteUserRole,
      handleUpdateUserRole,
    },
  } = useEmployerStack();

  return (
    <main className="relative w-full overflow-hidden flex flex-col p-4 gap-4">
      <div className="w-full h-full flex relative overflow-y-auto">
        <ProfilesDataTable
          users={users}
          handleCreateNewUser={handleCreateNewUser}
          handleUpdateUser={handleUpdateUser}
          handleDeleteUser={handleDeleteUser}
          handleAddUserRole={handleAddUserRole}
          handleDeleteUserRole={handleDeleteUserRole}
          handleUpdateUserRole={handleUpdateUserRole}
          loading={usersLoading}
          excludeRoles={["admin", "employer", "student", "teacher", "class_manager"]}
        />
      </div>
    </main>
  );
}
