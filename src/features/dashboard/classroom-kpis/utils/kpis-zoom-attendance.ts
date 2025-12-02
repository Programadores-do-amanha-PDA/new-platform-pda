import { eachMonthOfInterval, eachWeekOfInterval, isSameMonth, isSameWeek, lastDayOfMonth, startOfMonth } from "date-fns";

import { calculateClassPresence } from "../../classroom-attendance/utils/attendance-calculator";
import { calculateWeeklyClassPresence } from "../../classroom-attendance/utils/weekly-attendance-calcs";
import {
    AttendanceAccumulatorT,
    GetAttendanceByWeeklyMeetingsGroupedByMonthProps,
    GetAttendanceByWeeklyMeetingsGroupedByMonthResults,
    GetAttendanceAccumulatorProps,
} from "../types/zoom-attendance.types";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "KPIs-zoom-attendance" });

export const getAttendanceAccumulator = ({
    meetings,
    allAggregateInMetricUsers,
    classroomClassTypes,
}: GetAttendanceAccumulatorProps): AttendanceAccumulatorT => {
    return meetings.reduce(
        (accumulator, meeting) => {
            const meetingClassType = classroomClassTypes.find((classType) => classType.id === meeting.class_type);

            if (!meetingClassType) {
                return accumulator;
            }

            let presencePercentage = 0;

            if (meetingClassType.presence_calc_type === "byWeeklyMeetings") {
                presencePercentage = calculateWeeklyClassPresence(meetings, allAggregateInMetricUsers).overallPresence;
            } else if (meetingClassType.presence_calc_type === "bySingleMeeting") {
                presencePercentage = calculateClassPresence(meeting, allAggregateInMetricUsers);
            } else {
                return accumulator;
            }

            return {
                totalPresencePercentage: accumulator.totalPresencePercentage + presencePercentage,
                count: accumulator.count + 1,
            };
        },
        { totalPresencePercentage: 0, count: 0 } as AttendanceAccumulatorT,
    );
};

export const getAttendanceByWeeklyMeetingsGroupedByMonth = ({
    allMeetings,
    allAggregateInMetricUsers,
    classroomClassTypes,
}: GetAttendanceByWeeklyMeetingsGroupedByMonthProps): GetAttendanceByWeeklyMeetingsGroupedByMonthResults[] => {
    try {
        if (!allMeetings.length || !allAggregateInMetricUsers.length || !classroomClassTypes.length)
            throw new Error("all params is required");

        const firstMeetingByStartTime = allMeetings.sort(
            (a, b) => new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime(),
        )[0];
        const lastMeetingByStartTime = allMeetings.sort(
            (a, b) => new Date(b.start_time!).getTime() - new Date(a.start_time!).getTime(),
        )[0];

        if (!firstMeetingByStartTime.start_time || !lastMeetingByStartTime.start_time)
            throw new Error("No first or last meeting found");

        const months = eachMonthOfInterval({
            start: new Date(firstMeetingByStartTime.start_time),
            end: new Date(lastMeetingByStartTime.start_time),
        });

        if (!months.length) throw new Error("No months of interval");

        const attendanceByWeeklyMeetingsGroupedByMonth = months.map((month) => {
            try {
                if (!month) throw new Error("No month found");

                const monthMeetings = allMeetings.filter((meeting) => {
                    const meetingDate = new Date(meeting.start_time!);
                    return isSameMonth(meetingDate, month);
                });

                if (!monthMeetings.length) throw new Error("No meetings found");

                const monthMeetingsAttendance = getAttendanceAccumulator({
                    meetings: monthMeetings,
                    allAggregateInMetricUsers,
                    classroomClassTypes,
                });

                const weeksInMonth = eachWeekOfInterval({
                    start: startOfMonth(month),
                    end: lastDayOfMonth(month),
                });

                if (!weeksInMonth.length) throw new Error("No weeks found");

                const weeklyMeetings = weeksInMonth.map((week) => {
                    const meetings = allMeetings.filter((meeting) => {
                        const meetingDate = new Date(meeting.start_time!);
                        return isSameWeek(meetingDate, month);
                    });

                    return { week, meetings: meetings };
                });

                if (!weeklyMeetings.length) throw new Error("No weekly meetings found");

                const weeklyMeetingsAttendance = weeklyMeetings.map((wm) => {
                    return {
                        date: wm.week,
                        attendance: getAttendanceAccumulator({
                            meetings: wm.meetings,
                            allAggregateInMetricUsers,
                            classroomClassTypes,
                        }),
                    };
                });

                if (!weeklyMeetingsAttendance.length) throw new Error("No weekly meetings attendance found");

                return {
                    month: { date: month, attendance: monthMeetingsAttendance },
                    weeks: weeklyMeetingsAttendance,
                } as GetAttendanceByWeeklyMeetingsGroupedByMonthResults;
            } catch (error) {
                log.error({ err: error }, "Error in getAttendanceByWeeklyMeetingsGroupedByMonth");
                return null as unknown as GetAttendanceByWeeklyMeetingsGroupedByMonthResults;
            }
        });

        if (!attendanceByWeeklyMeetingsGroupedByMonth.length)
            return [] as unknown as GetAttendanceByWeeklyMeetingsGroupedByMonthResults[];

        return attendanceByWeeklyMeetingsGroupedByMonth.filter(
            (month) => month !== null,
        ) as GetAttendanceByWeeklyMeetingsGroupedByMonthResults[];
    } catch (error) {
        log.error({ err: error }, "Error in getAttendanceByWeeklyMeetingsGroupedByMonth");
        return [] as unknown as GetAttendanceByWeeklyMeetingsGroupedByMonthResults[];
    }
};
