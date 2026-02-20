"use client";

import UsersDataTable from "./components/users-data-table";
import { useClassroomStore } from "@/features/classrooms/list/store";
import { useUsersStore } from "@/features/users/management";
import { useEnrollmentsManagementStore } from "@/features/enrollments";

export default function AllUsersPage() {
    const { loading: usersLoading } = useUsersStore();
    const { loading: enrollmentsLoading } = useEnrollmentsManagementStore();
    const { loading: classroomsLoading } = useClassroomStore();

    return (
        <main className="relative flex flex-col gap-4 p-4 w-full overflow-hidden">
            <div className="relative flex w-full h-full overflow-y-auto">
                <UsersDataTable loading={usersLoading || classroomsLoading || enrollmentsLoading} />
            </div>
        </main>
    );
}
