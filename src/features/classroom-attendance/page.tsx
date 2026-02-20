"use client";
import { useParams } from "next/navigation";

import AttendanceTable from "./components/attendance-table";
import { useAttendanceData } from "./hooks/use-attendance-data";

export default function AttendancePage() {
    const { classroom_id } = useParams<{ classroom_id: string }>();

    const { allPastsMeetings, allVisibleUsers, allAggregateInMetricUsers } = useAttendanceData({
        classroomId: classroom_id ?? "",
    });

    if (!classroom_id) {
        return <div>Turma não encontrada.</div>;
    }

    return (
        <div className="p-4 w-full h-full">
            <AttendanceTable
                allVisibleUsers={allVisibleUsers}
                allAggregateInMetricUsers={allAggregateInMetricUsers}
                meetings={allPastsMeetings}
                classroomId={classroom_id}
            />
        </div>
    );
}
