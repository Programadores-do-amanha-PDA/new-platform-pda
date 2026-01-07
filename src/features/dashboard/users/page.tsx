"use client";

import ProfilesDataTable from "./admin/components/profiles-data-table";
import { useClassroomStore } from "../classrooms/classrooms-homepage/store";
import { useUsersStore } from "@/features/dashboard/shared/users";
import { useEnrollmentsStore } from "@/features/dashboard/shared/enrollments";

export default function AllUsersPage() {
    const { loading: usersLoading } = useUsersStore();
    const { loading: enrollmentsLoading } = useEnrollmentsStore();
    const { loading: classroomsLoading } = useClassroomStore();

    return (
        <main className="relative flex flex-col gap-4 p-4 w-full overflow-hidden">
            <div className="relative flex w-full h-full overflow-y-auto">
                <ProfilesDataTable loading={usersLoading || classroomsLoading || enrollmentsLoading} />
            </div>
        </main>
    );
}
