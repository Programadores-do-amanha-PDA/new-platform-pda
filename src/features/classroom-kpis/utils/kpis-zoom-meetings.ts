import { eachMonthOfInterval, eachWeekOfInterval, format, lastDayOfMonth, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { logger } from "@/lib/logger";
import { GetMonthsAndWeeksInMonthByMeetingsProps, GetMonthsAndWeeksInMonthByMeetingsResult } from "../types";

const log = logger.child({ module: "kpis-zoom-meetings" });

export const getMonthsAndWeeksInMonthByMeetings = ({
    meetings,
}: GetMonthsAndWeeksInMonthByMeetingsProps): GetMonthsAndWeeksInMonthByMeetingsResult[] => {
    try {
        if (!meetings.length) throw new Error("No meetings found");

        // Find min and max meeting times in a single pass instead of sorting twice
        let firstMeetingByStartTime = meetings[0];
        let lastMeetingByStartTime = meetings[0];

        for (const meeting of meetings) {
            const meetingTime = new Date(meeting.start_time!).getTime();
            const firstTime = new Date(firstMeetingByStartTime.start_time!).getTime();
            const lastTime = new Date(lastMeetingByStartTime.start_time!).getTime();

            if (meetingTime < firstTime) {
                firstMeetingByStartTime = meeting;
            }
            if (meetingTime > lastTime) {
                lastMeetingByStartTime = meeting;
            }
        }

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
