"use client";
import { DataTable } from "./data-table";
import InsertManyUsersDialog from "./insert-many-users-dialog";
import UserModalData from "./user-modal-data";
import BulkPasswordResetButton from "./bulk-password-reset-button";
import BulkEmailVerificationButton from "./bulk-email-verification-button";
import BulkUsersCredentialsButton from "./bulk-users-credentials-button";
import { AuthUserWithProfile } from "@/features/dashboard/profile";
import { Role } from "@/types";
import { useUsersStore } from "@/features/dashboard/shared/users";
import { useClassroomStore } from "@/features/dashboard/classrooms/home-page/store";
import { useUsersColumns } from "../hooks/use-users-columns";

type UsersDataTableProps = {
    excludeRoles?: Role[];
    defaultRoleValue?: Role;
    loading: boolean;
};

const UsersDataTable = ({ loading, excludeRoles }: UsersDataTableProps) => {
    const { classrooms } = useClassroomStore();
    const { users, deleteUser } = useUsersStore();

    const { allColumns } = useUsersColumns({
        excludeRoles,
        classrooms,
        deleteUser,
    });

    const headerOptions = (selectedUsers: AuthUserWithProfile[], clearSelection?: () => void) => (
        <div className="flex gap-4">
            <BulkUsersCredentialsButton selectedUsers={selectedUsers} />
            <BulkEmailVerificationButton selectedUsers={selectedUsers} onComplete={clearSelection} />
            <BulkPasswordResetButton selectedUsers={selectedUsers} onComplete={clearSelection} />

            <InsertManyUsersDialog excludeRoles={excludeRoles} classrooms={classrooms} />

            <UserModalData mode="new" excludeRoles={excludeRoles} />
        </div>
    );

    return <DataTable columns={allColumns} data={users} loading={loading} headerRightOptions={headerOptions} />;
};

export default UsersDataTable;
