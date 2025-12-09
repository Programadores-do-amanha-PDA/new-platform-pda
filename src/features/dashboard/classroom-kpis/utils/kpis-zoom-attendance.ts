import { GetMonthsAndWeeksInMonthByMeetingsResult } from "./../types/zoom-attendance.types";
import {
    eachMonthOfInterval,
    eachWeekOfInterval,
    format,
    isSameMonth,
    isSameWeek,
    lastDayOfMonth,
    startOfMonth,
} from "date-fns";

import { calculateClassPresence } from "../../classroom-attendance/utils/attendance-calculator";
import { calculateWeeklyClassPresence } from "../../classroom-attendance/utils/weekly-attendance-calcs";
import {
    AttendanceAccumulatorT,
    GetAttendanceByWeeklyMeetingsGroupedByMonthProps,
    GetAttendanceByWeeklyMeetingsGroupedByMonthResults,
    GetAttendanceAccumulatorProps,
    GetMonthsAndWeeksInMonthByMeetingsProps,
} from "../types/zoom-attendance.types";
import { logger } from "@/lib/logger";
import { ptBR } from "date-fns/locale";

const log = logger.child({ module: "KPIs-zoom-attendance" });

export const getAttendanceAccumulator = ({
    meetings,
    allAggregateInMetricUsers,
    classroomClassTypes,
}: GetAttendanceAccumulatorProps): AttendanceAccumulatorT | null => {
    // Se não houver reuniões, retorna null para indicar ausência de dados
    if (!meetings.length) {
        return null;
    }

    const processedWeeklyMeetings = new Set<string>();

    const result = meetings.reduce(
        (accumulator, meeting) => {
            const meetingClassType = classroomClassTypes.find((classType) => classType.id === meeting.class_type);

            if (!meetingClassType) {
                return accumulator;
            }

            let presencePercentage = 0;

            if (meetingClassType.presence_calc_type === "byWeeklyMeetings") {
                // Filtra apenas as reuniões do mesmo tipo de classe
                const weeklyMeetingsOfSameType = meetings.filter((m) => m.class_type === meeting.class_type);
                
                // Cria uma chave única para evitar processar o mesmo grupo de reuniões semanais múltiplas vezes
                const weeklyKey = `${meeting.class_type}`;
                
                if (processedWeeklyMeetings.has(weeklyKey)) {
                    return accumulator;
                }
                
                processedWeeklyMeetings.add(weeklyKey);
                presencePercentage = calculateWeeklyClassPresence(weeklyMeetingsOfSameType, allAggregateInMetricUsers).overallPresence;
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

    // Calcula a porcentagem média
    const averagePresencePercentage = result.count > 0 ? result.totalPresencePercentage / result.count : 0;

    return {
        totalPresencePercentage: averagePresencePercentage,
        count: result.count,
    };
};

export const getMonthsAndWeeksInMonthByMeetings = ({
    meetings,
}: GetMonthsAndWeeksInMonthByMeetingsProps): GetMonthsAndWeeksInMonthByMeetingsResult[] => {
    try {
        if (!meetings.length) throw new Error("No meetings found");
        const firstMeetingByStartTime = meetings.sort(
            (a, b) => new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime(),
        )[0];
        const lastMeetingByStartTime = meetings.sort(
            (a, b) => new Date(b.start_time!).getTime() - new Date(a.start_time!).getTime(),
        )[0];
        if (!firstMeetingByStartTime.start_time || !lastMeetingByStartTime.start_time)
            throw new Error("No first or last meeting found");

        const months = eachMonthOfInterval({
            start: new Date(firstMeetingByStartTime.start_time),
            end: new Date(lastMeetingByStartTime.start_time),
        }).sort((a, b) => b.getTime() - a.getTime());

        if (!months.length) throw new Error("No months found");

        const monthWithWeeks = months.map((month) => {
            const weeksInMonth = eachWeekOfInterval({
                start: startOfMonth(month),
                end: lastDayOfMonth(month),
            }).sort((a, b) => b.getTime() - a.getTime());

            return { month, weeks: weeksInMonth || [] };
        });

        if (!monthWithWeeks.length) throw new Error("No weeks found");

        return monthWithWeeks;
    } catch (error) {
        if (error instanceof Error) {
            log.error(error.message);
        } else {
            log.info(error);
        }
        return [];
    }
};

export const getAttendanceByWeeklyMeetingsGroupedByMonth = ({
    allMeetings,
    allAggregateInMetricUsers,
    classroomClassTypes,
}: GetAttendanceByWeeklyMeetingsGroupedByMonthProps): GetAttendanceByWeeklyMeetingsGroupedByMonthResults[] => {
    try {
        if (!allMeetings.length || !allAggregateInMetricUsers.length || !classroomClassTypes.length)
            throw new Error("all params is required");

        const monthsWithWeeks = getMonthsAndWeeksInMonthByMeetings({ meetings: allMeetings });

        if (!monthsWithWeeks.length) throw new Error("No months of interval");

        const attendanceByWeeklyMeetingsGroupedByMonth = monthsWithWeeks.map(({ month, weeks: weeksInMonth }) => {
            try {
                if (!month) throw new Error("No month found");

                const monthMeetings = allMeetings.filter((meeting) => {
                    const meetingDate = new Date(meeting.start_time!);
                    return isSameMonth(meetingDate, month);
                });

                if (!monthMeetings.length) throw new Error("No meetings found");

                if (!weeksInMonth.length) throw new Error("No weeks found");

                const weeklyMeetings = weeksInMonth.map((week) => {
                    const meetings = allMeetings.filter((meeting) => {
                        const meetingDate = new Date(meeting.start_time!);
                        return isSameWeek(meetingDate, week);
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

                // Calcula a média mensal apenas das semanas que tiveram reuniões
                const weeksWithMeetings = weeklyMeetingsAttendance.filter((w) => w.attendance !== null);
                const monthAttendance = weeksWithMeetings.length > 0
                    ? {
                        totalPresencePercentage: weeksWithMeetings.reduce((sum, w) => sum + (w.attendance?.totalPresencePercentage || 0), 0) / weeksWithMeetings.length,
                        count: weeksWithMeetings.reduce((sum, w) => sum + (w.attendance?.count || 0), 0),
                    }
                    : null;

                return {
                    month: { date: month, attendance: monthAttendance },
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

export const extractMonthNameAndYearByDate = (date: Date): string => {
    try {
        if (!date) return "";
        return format(date, "MM/yyyy", {
            locale: ptBR,
        });
    } catch (error) {
        log.error({ err: error }, "Error in extractMonthNameAndYearByDate");
        return "";
    }
};

export const extractFirstDayOfWeekByDate = (date: Date): string => {
    try {
        if (!date) return "";
        return format(date, "dd");
    } catch (error) {
        log.error({ err: error }, "Error in extractFirstDayOfWeekByDate");
        return "";
    }
};
