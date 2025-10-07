import {
  ClassroomConfigClassTypesT,
  ClassroomConfigClassTypesLimitT,
  ClassroomConfigJustificationT,
} from "@/types/classroom-configs";
import { ZoomMeetingT, ZoomMeetingPastInstanceT } from "@/features/dashboard/classroom-zoom/types";

/**
 * Represents the attendance calculation result for a user in a meeting
 */
export interface AttendanceResult {
  /** Total minutes the user attended the meeting */
  minutesAttended: number;
  /** The class type limit that applies to this attendance */
  limit?: ClassroomConfigClassTypesLimitT;
  /** The justification applied (if any) */
  justification?: ClassroomConfigJustificationT;
}

/**
 * Calculates user attendance status and participation minutes for a meeting
 * 
 * This function determines attendance based on:
 * - User participation duration in the meeting
 * - Available justifications (if user provided one)
 * - Class type configuration and limits
 * - Default fallback rules when configuration is missing
 * 
 * @param meeting - The Zoom meeting or past instance to analyze
 * @param userEmail - Email of the user to calculate attendance for
 * @param currentClassType - Current class type configuration (optional)
 * @param availableJustifications - Array of available justifications (optional)
 * @returns Attendance result with status, minutes, and applied rules
 * 
 * @example
 * ```typescript
 * const result = calculateUserAttendance(
 *   zoomMeeting,
 *   'student@email.com',
 *   programmingClassType,
 *   availableJustifications
 * );
 * 
 * console.log(result.minutesAttended); // 45
 * console.log(result.limit?.key); // 'PP'
 * ```
 * 
 * @remarks
 * - Justifications take precedence over participation time
 * - Uses default rules when class type configuration is missing
 * - Handles both ZoomMeetingT and ZoomMeetingPastInstanceT
 */
export function calculateUserAttendance(
  meeting: ZoomMeetingT | ZoomMeetingPastInstanceT,
  userEmail: string,
  currentClassType?: ClassroomConfigClassTypesT,
  availableJustifications?: ClassroomConfigJustificationT[]
): AttendanceResult {
  // Check if user has provided a justification for this meeting
  const userJustification = meeting.justifications?.find(
    (justification) => justification.user_email === userEmail
  );

  // Handle justified absence case
  if (userJustification) {
    // Fallback to default justification if none are configured
    if (!availableJustifications || availableJustifications.length === 0) {
      const defaultJustification = getDefaultJustification();
      return {
        minutesAttended: 0,
        justification: defaultJustification,
      };
    }

    // Find the most appropriate justification based on user message
    const bestJustification = findBestJustification(
      userJustification.message,
      availableJustifications
    );

    return {
      minutesAttended: 0,
      justification: bestJustification,
    };
  }

  // Find all user participations in this meeting
  const userParticipations =
    meeting.participants?.filter(
      (participant) => participant.user_email === userEmail
    ) || [];

  // Calculate total minutes attended (convert from seconds to minutes)
  const totalMinutesAttended = Math.round(
    userParticipations.reduce(
      (accumulator, participation) => accumulator + participation.duration,
      0
    ) / 60
  );

  // Use default limits if class type is not specified or configured
  if (!meeting.class_type || !currentClassType) {
    const defaultLimit = getDefaultLimit(totalMinutesAttended);
    return {
      minutesAttended: totalMinutesAttended,
      limit: defaultLimit,
    };
  }

  // Find the most appropriate limit based on minutes attended
  const bestLimit = findBestLimit(
    totalMinutesAttended,
    currentClassType.limits
  );

  return {
    minutesAttended: totalMinutesAttended,
    limit: bestLimit,
  };
}

/**
 * Provides a default justification when no justifications are configured
 * 
 * @returns Default justified absence configuration
 */
function getDefaultJustification(): ClassroomConfigJustificationT {
  return {
    id: "default-justified",
    key: "FJ",
    title: "Falta Justificada",
    color: "#0066cc",
    is_presence: true,
  };
}

/**
 * Finds the best matching justification based on user's message
 * 
 * Currently returns the first available justification, but can be enhanced
 * with NLP or keyword matching for more sophisticated justification handling
 * 
 * @param message - User's justification message
 * @param justifications - Available justification configurations
 * @returns Best matching justification or default if none available
 */
function findBestJustification(
  message: string,
  justifications: ClassroomConfigJustificationT[]
): ClassroomConfigJustificationT {
  if (justifications.length === 0) {
    return getDefaultJustification();
  }

  // TODO: Implement intelligent justification matching based on message content
  // Potential enhancement: Use NLP or keyword matching to find best fit
  
  // For now, return the first available justification
  return justifications[0];
}

/**
 * Provides default attendance limits based on legacy logic
 * 
 * Legacy rules:
 * - >= 60 minutes: Present (P)
 * - >= 30 minutes: Partial Presence (PP) 
 * - < 30 minutes: Absent (F)
 * 
 * @param minutesAttended - Total minutes user participated
 * @returns Default limit configuration based on minutes
 */
function getDefaultLimit(
  minutesAttended: number
): ClassroomConfigClassTypesLimitT {
  if (minutesAttended >= 60) {
    return {
      id: "default-present",
      min: 60,
      key: "P",
      title: "Presente",
      color: "#00ff00",
      allow_justification: false,
      is_presence: true,
    };
  } else if (minutesAttended >= 30) {
    return {
      id: "default-partial",
      min: 30,
      max: 59,
      key: "PP",
      title: "Presença Parcial",
      color: "#ffff00",
      allow_justification: true,
      is_presence: false,
    };
  } else {
    return {
      id: "default-absent",
      min: 0,
      max: 29,
      key: "F",
      title: "Falta",
      color: "#ff0000",
      allow_justification: true,
      is_presence: false,
    };
  }
}

/**
 * Finds the most appropriate class type limit based on minutes attended
 * 
 * Limits are evaluated from highest to lowest minimum requirements.
 * The first limit that matches the minute range is returned.
 * 
 * @param minutesAttended - Total minutes user participated
 * @param limits - Available class type limit configurations
 * @returns Best matching limit or undefined if no match found
 */
function findBestLimit(
  minutesAttended: number,
  limits: ClassroomConfigClassTypesLimitT[]
): ClassroomConfigClassTypesLimitT | undefined {
  // Sort limits by minimum requirement (highest to lowest)
  const sortedLimits = [...limits].sort((a, b) => b.min - a.min);

  // Find the first limit that matches the attendance criteria
  for (const limit of sortedLimits) {
    const meetsMinimum = minutesAttended >= limit.min;
    const withinMaximum = limit.max === undefined || minutesAttended <= limit.max;

    if (meetsMinimum && withinMaximum) {
      return limit;
    }
  }

  // No matching limit found
  return undefined;
}