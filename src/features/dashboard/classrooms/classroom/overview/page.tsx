"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { ClassroomOverviewTable } from "./components/classroom-overview-table";
import { useUsersStore } from "@/features/dashboard/shared/users/store";
import { useZoomMeetingStore, useZoomMeetingPastInstanceStore } from "../integrations/zoom/stores";
import { useActivityStore } from "../activities/store";
import { ClassroomSetting, useClassroomSettingStore } from "../settings";
import { useCoodeshAssessmentStore } from "../integrations/coodesh/stores/assessments";
import { useEnrollmentsStore } from "@/features/dashboard/shared/enrollments";
import { useClassroomOverviewData } from "./hooks/use-classroom-overview-data";
import { useClassroomProjectStore } from "../projects/stores";
import { useClassroomProjectCorrectionsStore } from "../projects/stores/corrections";
import { useClassroomProjectDeliveriesStore } from "../projects/stores/deliveries";

export default function ClassroomAttendancePage() {
    const { classroom_id } = useParams<{ classroom_id: string }>();
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);

    const { settingsByClassroom } = useClassroomSettingStore();
    const { users } = useUsersStore();
    const { updateEnrollmentByShortIdAndClassroomId } = useEnrollmentsStore();
    const { activities } = useActivityStore();
    const { assessments } = useCoodeshAssessmentStore();
    const { projects } = useClassroomProjectStore();
    const { deliveries } = useClassroomProjectDeliveriesStore();
    const { corrections } = useClassroomProjectCorrectionsStore();
    const { pastInstances } = useZoomMeetingPastInstanceStore();
    const { meetings } = useZoomMeetingStore();

    const currentSetting: ClassroomSetting = settingsByClassroom[classroom_id];
    const currentSettingUserModes = useMemo(() => currentSetting?.user_modes || [], [currentSetting]);
    const modules = useMemo(() => currentSetting?.modules || [], [currentSetting?.modules]);
    const classroomDeliveries = useMemo(() => deliveries[classroom_id] || [], [deliveries, classroom_id]);
    const classroomCorrections = useMemo(() => corrections[classroom_id] || [], [corrections, classroom_id]);

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
    });

    const handleDateRangeChange = (newDateRange: { from: Date; to: Date }) => {
        setDateRange(newDateRange);
    };

    const handleUserModeChange = async (studentId: string, userModeId: string) => {
        const student = data.students.find((student) => student.id === studentId);
        if (!student) return;

        await updateEnrollmentByShortIdAndClassroomId({
            shortId: student.shortId,
            classroomId: classroom_id,
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
