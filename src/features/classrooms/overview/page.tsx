"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { ClassroomOverviewTable } from "./components/classroom-overview-table";
import { useUsersStore } from "@/features/users/management";
import { ClassroomSetting, useClassroomSettingStore } from "../settings";
import { useEnrollmentsManagementStore } from "@/features/enrollments";
import { useClassroomOverviewData } from "./hooks/use-classroom-overview-data";
import { useActivityStore } from "@/features/classroom-activities";
import { useCoodeshAssessmentStore } from "@/features/classroom-coodesh/stores/assessments";
import { useClassroomProjectStore } from "@/features/classroom-projects/stores";
import { useClassroomProjectCorrectionsStore } from "@/features/classroom-projects/stores/corrections";
import { useClassroomProjectDeliveriesStore } from "@/features/classroom-projects/stores/deliveries";
import { useZoomMeetingStore } from "@/features/classroom-zoom/stores/meetings";
import { useZoomMeetingPastInstanceStore } from "@/features/classroom-zoom/stores/past-instances";

export default function ClassroomAttendancePage() {
    const { classroom_id } = useParams<{ classroom_id: string }>();
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);

    const { settingsByClassroom } = useClassroomSettingStore();
    const { users } = useUsersStore();
    const { enrollmentsByUserId, updateEnrollmentByShortIdAndUserId } = useEnrollmentsManagementStore();
    const { activities } = useActivityStore();
    const { assessments } = useCoodeshAssessmentStore();
    const { projects } = useClassroomProjectStore();
    const { deliveries } = useClassroomProjectDeliveriesStore();
    const { corrections } = useClassroomProjectCorrectionsStore();
    const { pastInstances } = useZoomMeetingPastInstanceStore();
    const { meetings } = useZoomMeetingStore();

    const currentSetting: ClassroomSetting = settingsByClassroom[classroom_id];
    const currentSettingUserModes = currentSetting?.user_modes || [];
    const modules = currentSetting?.modules || [];
    const classroomDeliveries = deliveries[classroom_id] || [];
    const classroomCorrections = corrections[classroom_id] || [];

    // Use the custom hook to process classroom overview data
    const data = useClassroomOverviewData({
        classroomId: classroom_id,
        users,
        currentSetting,
        currentSettingUserModes,
        activities,
        assessments,
        projects,
        classroomDeliveries,
        classroomCorrections,
        pastInstances,
        meetings,
        dateRange,
        enrollmentsByUserId,
    });

    const handleDateRangeChange = (newDateRange: { from: Date; to: Date }) => {
        setDateRange(newDateRange);
    };

    const handleUserModeChange = async (studentId: string, userModeId: string) => {
        const student = data.students.find((student) => student.id === studentId);
        if (!student) return;

        await updateEnrollmentByShortIdAndUserId({
            shortId: student.shortId,
            userId: student.id,
            updates: { mode: userModeId },
        });
    };

    return (
        <div className="flex flex-col gap-4 p-4 w-full h-full overflow-hidden">
            <ClassroomOverviewTable
                data={data}
                modules={modules}
                onDateRangeChange={handleDateRangeChange}
                onUserModeChange={handleUserModeChange}
            />
        </div>
    );
}
