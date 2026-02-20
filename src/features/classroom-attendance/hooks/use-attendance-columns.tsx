"use client";

import { useCallback, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Color from "color";

import { Profile } from "@/features/users/profile/types/profile";
import { ClassroomSetting } from "@/features/classrooms/settings/types";
import { calculateClassPresence, calculateUserAttendance } from "../utils";
import { calculateUserWeeklyAttendance, getMeetingsByWeek } from "../utils/weekly-attendance-calcs";
import MeetingTypeSelector from "../components/meeting-type-selector";
import { AttendanceJustificationDropdown } from "../components/attendance-justification-dropdown";
import { DateRange } from "react-day-picker";
import { ZoomPastMeetingAndPastInstanciesAttendance } from "../types";
import { isWithinInterval } from "date-fns";
import { InfoIcon } from "lucide-react";

interface UseAttendanceColumnsProps {
    readonly allAggregateInMetricUsers: Profile[];
    readonly currentConfig: ClassroomSetting | null;
    readonly meetings: ZoomPastMeetingAndPastInstanciesAttendance[];
}

/**
 * Converts a color string to hex format.
 * Returns a default gray color if conversion fails.
 *
 * @param color - The color string to convert
 * @returns Hex color string
 */
const backgroundColor = (color: string | null | undefined): string => {
    try {
        if (!color) throw new Error("color null");
        return Color(color).hex();
    } catch {
        return "#f3f4f6";
    }
};

/**
 * Hook that generates table column definitions for attendance display.
 *
 * Creates a memoized array of column definitions for each meeting in the displayed period.
 * Each column shows the meeting date, type selector, class presence percentage, and individual
 * user attendance with justifications.
 *
 * @param {UseAttendanceColumnsProps} props - Configuration object
 *
 * @returns {ColumnDef<Profile>[]} Array of table column definitions for TanStack Table
 *
 * @remarks
 * - Columns update when displayedMeetings, classroomClassTypes, classroomJustifications, or allAggregateInMetricUsers change
 * - Supports both single meeting and weekly meeting attendance calculation
 * - Each column header shows date, meeting type selector, and overall class presence
 * - Each cell shows user attendance status with color coding and optional justification dropdown
 *
 * @example
 * ```tsx
 * const meetingColumns = useAttendanceColumns({
 *   displayedMeetings: meetings,
 *   classroomClassTypes: classTypes,
 *   classroomJustifications: justifications,
 *   allAggregateInMetricUsers: users,
 * });
 * ```
 */
export const useAttendanceColumns = ({
    allAggregateInMetricUsers,
    currentConfig,
    meetings,
}: UseAttendanceColumnsProps): {
    meetingColumns: ColumnDef<Profile>[];
    handleDateRangeChange: (newDateRange: DateRange) => void;
} => {
    const [dateRange, setDateRange] = useState<DateRange | null>(null);

    const handleDateRangeChange = useCallback((newDateRange: DateRange) => {
        setDateRange(newDateRange);
    }, []);

    const classroomClassTypes = useMemo(() => {
        if (currentConfig && currentConfig.class_types.length > 0) return currentConfig.class_types;
        else return [];
    }, [currentConfig]);

    const classroomJustifications = useMemo(() => {
        if (currentConfig && currentConfig.justifications.length > 0) return currentConfig.justifications;
        else return [];
    }, [currentConfig]);

    const displayedMeetings = useMemo(() => {
        if (!dateRange || !dateRange.from || !dateRange.to) return meetings;

        return meetings.filter((meeting) => {
            const meetingDate = new Date(meeting.start_time || 0);
            return isWithinInterval(meetingDate, {
                start: dateRange.from!,
                end: dateRange.to!,
            });
        });
    }, [meetings, dateRange]);
    /**
     * Dynamic columns for each meeting.
     * Updates when meetings, class types, justifications, or metric users change.
     */
    const meetingColumns = useMemo(() => {
        return displayedMeetings.map((meeting, index) => ({
            id: `meeting-${meeting.id}-${index}`,
            header: () => {
                const currentClassType = classroomClassTypes.find((classType) => classType.id === meeting.class_type);
                return (
                    <div className="flex flex-col justify-center items-center border-r border-b w-[155px]! h-full">
                        <div className="flex justify-center items-center px-2 border-b w-[155px]! h-11">
                            <p className="font-bold">
                                {new Date(meeting.start_time || 0).getTime() === new Date().getTime()
                                    ? "Hoje"
                                    : new Date(meeting.start_time || 0).toLocaleDateString("pt-BR", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "2-digit",
                                      })}
                            </p>
                        </div>
                        <div className="flex justify-center items-center p-2 w-[155px]! h-11">
                            <MeetingTypeSelector
                                key={`MeetingTypeSelector-${meeting.id}-${index}`}
                                meeting={meeting}
                                options={classroomClassTypes}
                            />
                        </div>
                        <div className="flex justify-center items-center gap-1 px-2 border-t w-[155px]! h-11">
                            <div className="flex flex-row items-center gap-2">
                                <p>{calculateClassPresence(meeting, allAggregateInMetricUsers)}%</p>

                                {currentClassType?.presence_calc_type === "byWeeklyMeetings" && (
                                    <p
                                        className="cursor-help"
                                        title="Este cálculo é baseado na presença do aluno apenas nesta reunião (Status JS são ignorados)."
                                    >
                                        <InfoIcon className="size-4" />
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            },
            cell: ({ row }: { row: { original: Profile } }) => {
                const userEmail = row.original.email;
                const shouldAggregateInMetric = allAggregateInMetricUsers.some((user) => user.email === userEmail);

                const currentClassType = classroomClassTypes.find((classType) => classType.id === meeting.class_type);

                let userAttendance;

                if (currentClassType?.presence_calc_type === "byWeeklyMeetings") {
                    const weekMeetings = getMeetingsByWeek(meeting, displayedMeetings, classroomClassTypes);

                    userAttendance = calculateUserWeeklyAttendance({
                        userEmail: userEmail || "",
                        currentMeeting: meeting,
                        weekMeetings,
                        currentClassType,
                        availableJustifications: classroomJustifications,
                        shouldAggregateInMetric,
                    });
                } else {
                    // Default single meeting calculation
                    userAttendance = calculateUserAttendance({
                        meeting,
                        userEmail: userEmail || "",
                        currentClassType: currentClassType!,
                        availableJustifications: classroomJustifications,
                        shouldAggregateInMetric,
                    });
                }

                return (
                    <div className="flex justify-between items-center gap-1 px-2 border-r border-b w-[155px]! h-[57px]">
                        <div className="flex flex-col">
                            <p
                                className="font-semibold"
                                style={{
                                    color: backgroundColor(
                                        userAttendance?.justification?.color || userAttendance?.limit?.color,
                                    ),
                                }}
                                title={userAttendance?.justification?.title || userAttendance?.limit?.title}
                            >
                                {userAttendance?.justification?.key || userAttendance?.limit?.key}
                            </p>

                            {userAttendance.minutesAttended > 0 && userAttendance?.limit?.key !== "--" && (
                                <p className="text-muted-foreground text-sm">{userAttendance.minutesAttended}M</p>
                            )}
                        </div>
                        {userEmail &&
                            userAttendance?.limit?.key !== "--" &&
                            (userAttendance?.justification || userAttendance?.limit?.allow_justification) && (
                                <AttendanceJustificationDropdown
                                    key={`AttendanceJustificationDropdown-${meeting.id}-${index}`}
                                    currentMeeting={meeting}
                                    currentUserEmail={userEmail}
                                    type={meeting.meeting_type}
                                />
                            )}
                    </div>
                );
            },
        }));
    }, [displayedMeetings, classroomClassTypes, classroomJustifications, allAggregateInMetricUsers]);

    return { meetingColumns: meetingColumns, handleDateRangeChange };
};
