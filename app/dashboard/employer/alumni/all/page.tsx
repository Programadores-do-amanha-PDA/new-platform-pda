"use client";
import ProfilesDataTable from "@/components/users/profiles-data-table";
import { AppBar } from "@/components/app-bar";
import { useEmployerStack } from "@/context/employer/stack-context";

export default function Home() {
  const {
    alumniStack: {
      alumni,
      handleDeleteAlumni,
      handleInsertNewAlumni,
      handleUpdateAlumni,
    },
    loading,
  } = useEmployerStack();

  return (
    <main className="relative w-full flex flex-col p-6 gap-4 xl:p-8">
      <AppBar />

      <div className="space-y-2">
        <ProfilesDataTable
          users={alumni}
          handleDeleteUser={handleDeleteAlumni}
          handleInsertNewUser={handleInsertNewAlumni}
          handleUpdateUser={handleUpdateAlumni}
          loading={loading}
          excludeRoles={[
            "admin",
            "employer",
            "student",
            "class_manager",
            "student",
            "teacher",
          ]}
        />
      </div>
    </main>
  );
}
