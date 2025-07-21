"use client"
import { useUsersCombinedStore } from "@/stores/modules/users/users-combined-store";
import ProfilesDataTable from "./admin/components/profiles-data-table";
import { useClassroomStore } from "@/stores/modules/classrooms";

export default function AllUsersPage() {
  const { isLoading } = useUsersCombinedStore();
  const { loading } = useClassroomStore();
  return (
    <main className="relative w-full overflow-hidden flex flex-col p-4 gap-4">
      <div className="w-full h-full flex relative overflow-y-auto">
        <ProfilesDataTable loading={isLoading() || loading} />
      </div>
    </main>
  );
}
