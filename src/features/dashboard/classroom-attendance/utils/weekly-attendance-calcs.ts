import { startOfWeek } from "date-fns";
import { AuthUserWithProfileT } from "@/types";
import { ZoomMeetingPastInstanceT, ZoomMeetingT } from "../../classroom-zoom/types";
import { calculateUserAttendance } from "./attendance-calculator";
import { ClassroomConfigJustificationT, ClassroomConfigClassTypesT } from "../../classroom-configs/types";
import {
    AttendanceCalculationOptionsT,
    WeeklyClassPresenceResultT,
    WeeklyPresenceDataT,
    AttendanceCalcResultT,
    CalculateUserWeeklyAttendancePropsT,
} from "../types";

/**
 * Default configuration for attendance calculations
 */
const DEFAULT_OPTIONS: Required<AttendanceCalculationOptionsT> = {
    weekStartsOn: 1, // Monday
    roundPrecision: 0,
};

/**
 * Calculates weekly class presence based on meeting attendance
 *
 * This function analyzes meeting attendance data to determine:
 * - Weekly presence percentages for the entire class
 * - Individual user presence across multiple meetings
 * - Overall class presence as an average of weekly percentages
 *
 * ## Key Features
 * - Groups meetings by calendar week
 * - Considers users present if they attended at least one meeting in the week
 * - Supports both ZoomMeetingT and ZoomMeetingPastInstanceT
 * - Handles justification-based presence
 * - Provides detailed weekly breakdowns
 *
 * @param meetings - Array of Zoom meetings and past instances
 * @param users - Array of users with profile data
 * @param options - Configuration options for calculation behavior
 * @returns Object containing weekly presence data and overall percentage
 *
 * @example
 * ```typescript
 * // Basic usage
 * const presence = calculateWeeklyClassPresence(meetings, users);
 *
 * // With custom options
 * const presence = calculateWeeklyClassPresence(meetings, users, {
 *   weekStartsOn: 0, // Sunday
 *   roundPrecision: 1
 * });
 *
 * // Access weekly data
 * Object.entries(presence.weeklyPresence).forEach(([weekKey, weekData]) => {
 *   console.log(`Week ${weekKey}: ${weekData.presencePercentage}% presence`);
 * });
 * ```
 *
 * @remarks
 * - Empty meetings or users arrays return zero presence
 * - Meetings without start_time are excluded from calculations
 * - Users without email addresses are excluded from presence tracking
 */
export function calculateWeeklyClassPresence(
    meetings: (ZoomMeetingT | ZoomMeetingPastInstanceT)[],
    users: Partial<AuthUserWithProfileT>[],
    options: AttendanceCalculationOptionsT = {},
): WeeklyClassPresenceResultT {
    const config = { ...DEFAULT_OPTIONS, ...options };

    // Early return for empty inputs
    if (!meetings.length || !users.length) {
        return {
            weeklyPresence: {},
            overallPresence: 0,
        };
    }

    const validUsers = filterValidUsers(users);
    const meetingsByWeek = groupMeetingsByWeek(meetings, config.weekStartsOn);
    const weeklyPresence = calculateWeeklyPresenceDataT(meetingsByWeek, validUsers, config);

    return {
        weeklyPresence,
        overallPresence: calculateOverallPresence(weeklyPresence, config.roundPrecision),
    };
}

/**
 * Filters users with valid email addresses for attendance tracking
 */
function filterValidUsers(users: Partial<AuthUserWithProfileT>[]): AuthUserWithProfileT[] {
    return users.filter((user): user is AuthUserWithProfileT => !!user.email && typeof user.email === "string");
}

/**
 * Groups meetings by their calendar week for presence analysis
 */
function groupMeetingsByWeek(
    meetings: (ZoomMeetingT | ZoomMeetingPastInstanceT)[],
    weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
): Map<string, { weekStart: Date; meetings: (ZoomMeetingT | ZoomMeetingPastInstanceT)[] }> {
    const weekGroups = new Map<string, { weekStart: Date; meetings: (ZoomMeetingT | ZoomMeetingPastInstanceT)[] }>();

    meetings.forEach((meeting) => {
        if (!meeting.start_time) return;

        const meetingDate = new Date(meeting.start_time);
        const weekStart = startOfWeek(meetingDate, { weekStartsOn });
        const weekKey = weekStart.toISOString();

        if (!weekGroups.has(weekKey)) {
            weekGroups.set(weekKey, {
                weekStart,
                meetings: [],
            });
        }

        weekGroups.get(weekKey)!.meetings.push(meeting);
    });

    return weekGroups;
}

/**
 * Calculates presence data for each week group
 */
function calculateWeeklyPresenceDataT(
    weekGroups: Map<string, { weekStart: Date; meetings: (ZoomMeetingT | ZoomMeetingPastInstanceT)[] }>,
    users: AuthUserWithProfileT[],
    config: Required<AttendanceCalculationOptionsT>,
): Record<string, WeeklyPresenceDataT> {
    const weeklyPresence: Record<string, WeeklyPresenceDataT> = {};

    Array.from(weekGroups.entries()).forEach(([weekKey, weekData]) => {
        const presentUsers = calculatePresentUsersForWeek(weekData.meetings, users);

        const presencePercentage = calculatePresencePercentage(presentUsers.size, users.length, config.roundPrecision);

        weeklyPresence[weekKey] = {
            weekStart: weekData.weekStart,
            meetings: weekData.meetings,
            presencePercentage,
            presentUsers: Array.from(presentUsers),
        };
    });

    return weeklyPresence;
}

/**
 * Identifies users present in at least one meeting during the week
 */
function calculatePresentUsersForWeek(
    weekMeetings: (ZoomMeetingT | ZoomMeetingPastInstanceT)[],
    users: AuthUserWithProfileT[],
    currentClassType?: ClassroomConfigClassTypesT,
    availableJustifications?: ClassroomConfigJustificationT[],
    shouldAggregateInMetric: boolean = true,
): Set<string> {
    const presentUsers = new Set<string>();

    users.forEach((user) => {
        if (!user.email) return;

        // Check if user was present in ANY meeting during the week
        const wasPresent = weekMeetings.some((meeting) => {
            const attendance = calculateUserAttendance({
                meeting,
                userEmail: user.email!,
                currentClassType,
                availableJustifications,
                shouldAggregateInMetric,
            });
            return attendance.justification?.is_presence || attendance.limit?.is_presence === true;
        });

        if (wasPresent) {
            presentUsers.add(user.email);
        }
    });

    return presentUsers;
}



/**
 * Calculates presence percentage with configurable rounding
 */
function calculatePresencePercentage(presentCount: number, totalCount: number, roundPrecision: number): number {
    if (totalCount === 0) return 0;

    const percentage = (presentCount / totalCount) * 100;

    if (roundPrecision === 0) {
        return Math.round(percentage);
    }

    return Number(percentage.toFixed(roundPrecision));
}

/**
 * Calculates overall presence as average of weekly percentages
 */
function calculateOverallPresence(weeklyPresence: Record<string, WeeklyPresenceDataT>, roundPrecision: number): number {
    const weeklyPercentages = Object.values(weeklyPresence).map((week) => week.presencePercentage);

    if (weeklyPercentages.length === 0) return 0;

    const average = weeklyPercentages.reduce((sum, percentage) => sum + percentage, 0) / weeklyPercentages.length;

    return roundPrecision === 0 ? Math.round(average) : Number(average.toFixed(roundPrecision));
}

/**
 * Calculates individual user's weekly presence
 *
 * Determines if a user was present in at least one meeting during the specified week
 *
 * @param userEmail - User's email address for identification
 * @param meetings - Array of meetings for the target week
 * @param includeJustifications - Whether to count justifications as presence
 * @returns True if user was present in at least one meeting
 *
 * @example
 * ```typescript
 * // Check user presence for a specific week
 * const wasPresent = calculateUserWeeklyPresence(
 *   'student@email.com',
 *   weekMeetings,
 *   true
 * );
 *
 * if (wasPresent) {
 *   console.log('Student attended at least one meeting this week');
 * }
 * ```
 */
export function calculateUserWeeklyPresence(
    userEmail: string,
    meetings: (ZoomMeetingT | ZoomMeetingPastInstanceT)[],
    includeJustifications: boolean = true,
    currentClassType?: ClassroomConfigClassTypesT,
    availableJustifications?: ClassroomConfigJustificationT[],
    shouldAggregateInMetric: boolean = true,
): boolean {
    if (!userEmail || !meetings.length) {
        return false;
    }

    return meetings.some((meeting) => {
        const attendance = calculateUserAttendance({
            meeting,
            userEmail,
            currentClassType,
            availableJustifications,
            shouldAggregateInMetric,
        });
        
        if (includeJustifications && attendance.justification?.is_presence) {
            return true;
        }
        
        return attendance.limit?.is_presence === true;
    });
}

/**
 * Calculates user attendance for weekly meetings with justification logic
 *
 * This function implements a three-step priority system:
 * 1. Preserve explicit justifications (never override them)
 * 2. Show actual attendance status when user was present
 * 3. Apply weekly justification only when user was absent but present elsewhere in the week
 *
 * @param userEmail - User's email address
 * @param currentMeeting - The specific meeting being evaluated
 * @param weekMeetings - All meetings in the same week
 * @param currentClassType - Class type configuration
 * @param availableJustifications - Available justification options
 * @param shouldAggregateInMetric - Whether user should be counted in metrics
 * @returns Attendance calculation result with weekly logic applied
 *
 * @example
 * ```typescript
 * const attendance = calculateUserWeeklyAttendance({
 *   userEmail: 'student@email.com',
 *   currentMeeting: meeting,
 *   weekMeetings: allWeekMeetings,
 *   currentClassType: programmingType,
 *   availableJustifications: justifications,
 *   shouldAggregateInMetric: true
 * });
 * ```
 */
export function calculateUserWeeklyAttendance({
    userEmail,
    currentMeeting,
    weekMeetings,
    currentClassType,
    availableJustifications,
    shouldAggregateInMetric = true,
}: CalculateUserWeeklyAttendancePropsT): AttendanceCalcResultT {
    // Calculate attendance for the current meeting
    const userAttendanceInCurrentMeeting = calculateUserAttendance({
        meeting: currentMeeting,
        userEmail,
        currentClassType,
        availableJustifications,
        shouldAggregateInMetric,
    });

    // STEP 1: Preserve explicit justifications
    // If user has an explicit justification (regardless of is_presence value), preserve it
    if (userAttendanceInCurrentMeeting.justification) {
        return userAttendanceInCurrentMeeting;
    }

    // STEP 2: Show actual attendance status
    // If user was present in this specific meeting, return the actual attendance
    if (userAttendanceInCurrentMeeting.limit?.is_presence) {
        return userAttendanceInCurrentMeeting;
    }

    // STEP 3: Apply weekly justification if applicable
    // User was absent from this meeting - check if they were present in other meetings this week
    const wasUserPresentInWeek = calculateUserWeeklyPresence(
        userEmail,
        weekMeetings,
        true,
        currentClassType,
        availableJustifications,
        shouldAggregateInMetric
    );

    // If user was present in at least one other meeting this week, apply weekly justification
    if (wasUserPresentInWeek) {
        return {
            minutesAttended: 0,
            justification: getDefaultWeeklyJustification(),
        };
    }

    // User was absent from all meetings this week - return normal absence calculation
    return userAttendanceInCurrentMeeting;
}

/**
 * Provides a default justification for weekly meetings when user attended other meetings in the week
 */
function getDefaultWeeklyJustification(): ClassroomConfigJustificationT {
    return {
        id: "weekly-justified",
        key: "JS",
        title: "Justificação Semanal",
        color: "#0066cc",
        is_presence: true,
    };
}

/**
 * Gets all meetings of the same class type that occur in the same week as the target meeting
 *
 * @param targetMeeting - The meeting to find weekly companions for
 * @param allMeetings - All available meetings to filter from
 * @param classTypes - Available class types to match against
 * @returns Array of meetings from the same class type and week
 *
 * @example
 * ```typescript
 * const weekMeetings = getMeetingsByWeek(
 *   currentMeeting,
 *   displayedMeetings,
 *   classroomClassTypes
 * );
 * ```
 */
export function getMeetingsByWeek<T extends { class_type?: string | number; start_time?: string | number }>(
    targetMeeting: T,
    allMeetings: T[],
    classTypes: Array<{ id: string | number }>,
): T[] {
    // Find the class type for the target meeting
    const currentClassType = classTypes.find((classType) => classType.id === targetMeeting.class_type);

    if (!currentClassType) {
        return [];
    }

    // Filter meetings by the same class type
    const allMeetingByClassType = allMeetings.filter((meeting) => meeting.class_type === currentClassType.id);

    // Get the target meeting date
    const meetingDate = new Date(targetMeeting.start_time || 0);

    // Calculate week boundaries (Monday to Sunday)
    const startOfWeek = new Date(meetingDate);
    startOfWeek.setDate(meetingDate.getDate() - meetingDate.getDay() + 1); // Monday

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

    // Filter meetings that fall within the same week
    return allMeetingByClassType.filter((meeting) => {
        const mDate = new Date(meeting.start_time || 0);
        return mDate >= startOfWeek && mDate <= endOfWeek;
    });
}
