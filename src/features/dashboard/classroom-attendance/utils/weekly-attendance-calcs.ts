import { startOfWeek } from "date-fns";
import { AuthUserWithProfileT } from "@/types";
import {
  ZoomMeetingPastInstanceT,
  ZoomMeetingT,
} from "../../classroom-zoom/types";
import { calculateUserAttendance } from ".";
import {
  AttendanceCalculationOptionsT,
  WeeklyClassPresenceResultT,
  WeeklyPresenceDataT,
} from "../types";

/**
 * Default configuration for attendance calculations
 */
const DEFAULT_OPTIONS: Required<AttendanceCalculationOptionsT> = {
  weekStartsOn: 1, // Monday
  roundPrecision: 0,
  includeJustifications: true,
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
  options: AttendanceCalculationOptionsT = {}
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
  const weeklyPresence = calculateWeeklyPresenceDataT(
    meetingsByWeek,
    validUsers,
    config
  );

  return {
    weeklyPresence,
    overallPresence: calculateOverallPresence(
      weeklyPresence,
      config.roundPrecision
    ),
  };
}

/**
 * Filters users with valid email addresses for attendance tracking
 */
function filterValidUsers(
  users: Partial<AuthUserWithProfileT>[]
): AuthUserWithProfileT[] {
  return users.filter(
    (user): user is AuthUserWithProfileT =>
      !!user.email && typeof user.email === "string"
  );
}

/**
 * Groups meetings by their calendar week for presence analysis
 */
function groupMeetingsByWeek(
  meetings: (ZoomMeetingT | ZoomMeetingPastInstanceT)[],
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
): Map<
  string,
  { weekStart: Date; meetings: (ZoomMeetingT | ZoomMeetingPastInstanceT)[] }
> {
  const weekGroups = new Map<
    string,
    { weekStart: Date; meetings: (ZoomMeetingT | ZoomMeetingPastInstanceT)[] }
  >();

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
  weekGroups: Map<
    string,
    { weekStart: Date; meetings: (ZoomMeetingT | ZoomMeetingPastInstanceT)[] }
  >,
  users: AuthUserWithProfileT[],
  config: Required<AttendanceCalculationOptionsT>
): Record<string, WeeklyPresenceDataT> {
  const weeklyPresence: Record<string, WeeklyPresenceDataT> = {};

  Array.from(weekGroups.entries()).forEach(([weekKey, weekData]) => {
    const presentUsers = calculatePresentUsersForWeek(
      weekData.meetings,
      users,
      config
    );
    const presencePercentage = calculatePresencePercentage(
      presentUsers.size,
      users.length,
      config.roundPrecision
    );

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
  config: Required<AttendanceCalculationOptionsT>
): Set<string> {
  const presentUsers = new Set<string>();

  users.forEach((user) => {
    if (!user.email) return;

    const wasPresent = weekMeetings.some((meeting) =>
      isUserPresentInMeeting(meeting, user.email!, config.includeJustifications)
    );

    if (wasPresent) {
      presentUsers.add(user.email);
    }
  });

  return presentUsers;
}

/**
 * Determines if a user was present in a specific meeting
 */
function isUserPresentInMeeting(
  meeting: ZoomMeetingT | ZoomMeetingPastInstanceT,
  userEmail: string,
  includeJustifications: boolean
): boolean {
  const attendance = calculateUserAttendance({ meeting, userEmail });

  if (includeJustifications && attendance.justification?.is_presence) {
    return true;
  }

  return attendance.limit?.is_presence === true;
}

/**
 * Calculates presence percentage with configurable rounding
 */
function calculatePresencePercentage(
  presentCount: number,
  totalCount: number,
  roundPrecision: number
): number {
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
function calculateOverallPresence(
  weeklyPresence: Record<string, WeeklyPresenceDataT>,
  roundPrecision: number
): number {
  const weeklyPercentages = Object.values(weeklyPresence).map(
    (week) => week.presencePercentage
  );

  if (weeklyPercentages.length === 0) return 0;

  const average =
    weeklyPercentages.reduce((sum, percentage) => sum + percentage, 0) /
    weeklyPercentages.length;

  return roundPrecision === 0
    ? Math.round(average)
    : Number(average.toFixed(roundPrecision));
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
  includeJustifications: boolean = true
): boolean {
  if (!userEmail || !meetings.length) {
    return false;
  }

  return meetings.some((meeting) =>
    isUserPresentInMeeting(meeting, userEmail, includeJustifications)
  );
}