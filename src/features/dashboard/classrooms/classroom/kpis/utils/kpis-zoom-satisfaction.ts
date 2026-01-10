import { isSameMonth, isSameWeek } from "date-fns";

import {
    IGetSatisfactionByWeeklyMeetingsGroupedByMonthResults,
    IGetSatisfactionAccumulatorProps,
    IGetSatisfactionAccumulatorResult,
    IGetSatisfactionByWeeklyMeetingsGroupedByMonthProps,
} from "../types";
import { logger } from "@/lib/logger";
import { getMonthsAndWeeksInMonthByMeetings } from "./kpis-zoom-meetings";
import { calculatePollPercentage } from "../../zoom-satisfaction/utils/question-percentage-calc";

const log = logger.child({ module: "KPIs-zoom-satisfaction" });

export const getSatisfactionAccumulator = ({
    meetings,
    classroomClassTypes,
}: IGetSatisfactionAccumulatorProps): IGetSatisfactionAccumulatorResult | null => {
    // Se não houver reuniões, retorna null para indicar ausência de dados
    if (!meetings.length) {
        return null;
    }

    const result = meetings.reduce(
        (accumulator, meeting) => {
            const meetingClassType = classroomClassTypes.find((classType) => classType.id === meeting.class_type);

            if (!meetingClassType) {
                return accumulator;
            }

            const contentAnswers =
                meeting.poll_results?.map((poll) => poll.question_details[0]?.answer.toLowerCase()).filter(Boolean) || [];

            const facilitationAnswers =
                meeting.poll_results?.map((poll) => poll.question_details[1]?.answer.toLowerCase()).filter(Boolean) || [];
            const selfDevAnswers =
                meeting.poll_results?.map((poll) => poll.question_details[2]?.answer.toLowerCase()).filter(Boolean) || [];

            const contentPercentage = calculatePollPercentage(contentAnswers);
            const facilitationPercentage = calculatePollPercentage(facilitationAnswers);
            const selfDevPercentage = calculatePollPercentage(selfDevAnswers);

            const total = (contentPercentage + facilitationPercentage + selfDevPercentage) / 3 || 0;
            const totalContent = accumulator.indicators.totalContent + contentPercentage || 0;
            const totalFacilitation = accumulator.indicators.totalFacilitation + facilitationPercentage || 0;
            const totalSelfDev = accumulator.indicators.totalSelfDev + selfDevPercentage || 0;

            return {
                totalSatisfaction: accumulator.totalSatisfaction + total,
                indicators: {
                    totalContent,
                    totalFacilitation,
                    totalSelfDev,
                },
                count: accumulator.count + 1,
            };
        },
        {
            totalSatisfaction: 0,
            indicators: {
                totalContent: 0,
                totalFacilitation: 0,
                totalSelfDev: 0,
            },
            count: 0,
        } as IGetSatisfactionAccumulatorResult,
    );

    const averageSatisfaction = result.count > 0 ? result.totalSatisfaction / result.count : 0;
    const averageContent = result.count > 0 ? result.indicators.totalContent / result.count : 0;
    const averageFacilitation = result.count > 0 ? result.indicators.totalFacilitation / result.count : 0;
    const averageSelfDev = result.count > 0 ? result.indicators.totalSelfDev / result.count : 0;

    return {
        totalSatisfaction: averageSatisfaction,
        indicators: {
            totalContent: averageContent,
            totalFacilitation: averageFacilitation,
            totalSelfDev: averageSelfDev,
        },
        count: result.count ?? 0,
    };
};

export const getSatisfactionByWeeklyMeetingsGroupedByMonth = ({
    allMeetings,
    classroomClassTypes,
}: IGetSatisfactionByWeeklyMeetingsGroupedByMonthProps): IGetSatisfactionByWeeklyMeetingsGroupedByMonthResults[] => {
    try {
        if (!allMeetings.length || !classroomClassTypes.length) throw new Error("all params is required");

        const monthsWithWeeks = getMonthsAndWeeksInMonthByMeetings({ meetings: allMeetings });

        if (!monthsWithWeeks.length) throw new Error("No months of interval");

        const satisfactionByWeeklyMeetingsGroupedByMonth = monthsWithWeeks.map(({ month, weeks: weeksInMonth }) => {
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

                const weeklyMeetingsSatisfaction = weeklyMeetings.map((wm) => {
                    return {
                        date: wm.week,
                        satisfaction: getSatisfactionAccumulator({
                            meetings: wm.meetings,
                            classroomClassTypes,
                        }),
                    };
                });

                if (!weeklyMeetingsSatisfaction.length) throw new Error("No weekly meetings satisfaction found");

                // Calcula a média mensal apenas das semanas que tiveram reuniões
                const weeksWithMeetings = weeklyMeetingsSatisfaction.filter((w) => w.satisfaction);
                const monthSatisfaction =
                    weeksWithMeetings.length > 0
                        ? {
                              totalSatisfaction:
                                  weeksWithMeetings.reduce((sum, w) => sum + (w.satisfaction?.totalSatisfaction || 0), 0) /
                                  weeksWithMeetings.length,
                              indicators: {
                                  totalContent:
                                      weeksWithMeetings.reduce(
                                          (sum, w) => sum + (w.satisfaction?.indicators.totalContent || 0),
                                          0,
                                      ) / weeksWithMeetings.length,
                                  totalFacilitation:
                                      weeksWithMeetings.reduce(
                                          (sum, w) => sum + (w.satisfaction?.indicators.totalFacilitation || 0),
                                          0,
                                      ) / weeksWithMeetings.length,
                                  totalSelfDev:
                                      weeksWithMeetings.reduce(
                                          (sum, w) => sum + (w.satisfaction?.indicators.totalSelfDev || 0),
                                          0,
                                      ) / weeksWithMeetings.length,
                              },
                              count: weeksWithMeetings.reduce((sum, w) => sum + (w.satisfaction?.count || 0), 0),
                          }
                        : null;

                return {
                    month: { date: month, satisfaction: monthSatisfaction },
                    weeks: weeklyMeetingsSatisfaction,
                } as IGetSatisfactionByWeeklyMeetingsGroupedByMonthResults;
            } catch (error) {
                log.error({ err: error }, "Error in getAttendanceByWeeklyMeetingsGroupedByMonth");
                return null as unknown as IGetSatisfactionByWeeklyMeetingsGroupedByMonthResults;
            }
        });

        if (!satisfactionByWeeklyMeetingsGroupedByMonth.length)
            return [] as unknown as IGetSatisfactionByWeeklyMeetingsGroupedByMonthResults[];

        return satisfactionByWeeklyMeetingsGroupedByMonth.filter(
            (month) => month !== null,
        ) as IGetSatisfactionByWeeklyMeetingsGroupedByMonthResults[];
    } catch (error) {
        log.error({ err: error }, "Error in getAttendanceByWeeklyMeetingsGroupedByMonth");
        return [] as unknown as IGetSatisfactionByWeeklyMeetingsGroupedByMonthResults[];
    }
};
