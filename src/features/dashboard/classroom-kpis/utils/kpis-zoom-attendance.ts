import { eachMonthOfInterval, eachWeekOfInterval, isSameWeek, lastDayOfMonth, startOfMonth } from "date-fns";

import { calculateClassPresence } from "../../classroom-attendance/utils/attendance-calculator";
import { calculateWeeklyClassPresence } from "../../classroom-attendance/utils/weekly-attendance-calcs";
import {
    AttendanceAccumulatorT,
    GetAllWeeklyMeetingsGroupedByMonthProps,
    GetAttendanceAccumulatorProps,
} from "../types/zoom-attendance.types";

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

export const getAllWeeklyMeetingsGroupedByMonth = ({ allMeetings }: GetAllWeeklyMeetingsGroupedByMonthProps) =>
    eachMonthOfInterval({
        start: new Date(allMeetings[0].start_time!),
        end: new Date(allMeetings[allMeetings.length - 1].start_time!),
    }).map((month) => {
        const weeksInMonth = eachWeekOfInterval({
            start: startOfMonth(month),
            end: lastDayOfMonth(month),
        });

        const weeklyMeetings = weeksInMonth.map((week) => {
            const meetings = allMeetings.filter((meeting) => {
                const meetingDate = new Date(meeting.start_time!);
                return isSameWeek(meetingDate, month);
            });

            return { week, meetings: meetings };
        });
        return { month, weeklyMeetings };
    });
