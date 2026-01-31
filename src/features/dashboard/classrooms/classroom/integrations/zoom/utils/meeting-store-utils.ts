import { useUsersStore } from "@/features/users/management";
import { ZoomMeetingActionsAccountPickT, ZoomMeetingActionsMeetingPickT, ZoomMeetingParticipantT } from "../types";
import { useEnrollmentsManagementStore } from "@/features/enrollments";
/**
 * Validates Zoom account configuration for API operations
 *
 * Ensures all required account fields are present before making API calls
 *
 * @param account - Zoom account configuration to validate
 * @returns True if account is valid
 * @throws Error when required fields are missing
 */
export const validateZoomAccount = (account: ZoomMeetingActionsAccountPickT) => {
    const requiredFields = ["account_id", "id", "client_id", "client_secret", "classroom_id"] as const;
    const missingFields = requiredFields.filter((field) => !account[field]);

    if (missingFields.length > 0) {
        throw new Error(`Missing account fields: ${missingFields.join(", ")}`);
    }
    return true;
};

/**
 * Validates meeting data structure for critical operations
 *
 * @param meeting - Meeting object to validate
 * @returns True if meeting has required identifiers
 * @throws Error when required meeting fields are missing
 */
export const validateMeeting = (meeting: ZoomMeetingActionsMeetingPickT) => {
    const requiredFields = ["id", "meeting_id", "uuid"] as const;
    const missingFields = requiredFields.filter((field) => !meeting[field]);

    if (missingFields.length > 0) {
        throw new Error(`Missing meeting fields: ${missingFields.join(", ")}`);
    }
    return true;
};

/**
 * Retrieves participant emails for a specific classroom
 *
 * @param classroomId - The classroom identifier
 * @returns Array of user emails belonging to the classroom
 */
export const getClassroomUsersEmails = (classroomId: string): string[] => {
    // Access the user store directly
    const userStore = useUsersStore.getState();
    const { enrollmentsByUserId } = useEnrollmentsManagementStore.getState();

    // Extract emails of users associated with the specified classroom
    const classroomUsers = userStore.users
        .filter((user) => enrollmentsByUserId[user.id || ""]?.some((enrollment) => enrollment.classroom_id === classroomId))
        .map((user) => user.email)
        .filter((email): email is string => !!email);

    return classroomUsers;
};

/**
 * Calculates visibility for meeting instances based on participant presence
 *
 * Determines if a meeting instance should be visible in the schedule by checking
 * if classroom participants attended the meeting.
 *
 * @param instance - Meeting instance with participants data
 * @param classroomId - The classroom identifier for participant lookup
 * @returns True if the instance should be visible in the schedule
 */
export const calculateVisibility = (
    instance: {
        participants?: ZoomMeetingParticipantT[];
        is_visible_on_schedule?: boolean | undefined;
    },
    classroomId: string,
): boolean => {
    // Respect explicit visibility setting if provided
    if (instance.is_visible_on_schedule !== undefined && typeof instance.is_visible_on_schedule === "boolean") {
        return instance.is_visible_on_schedule;
    }

    // If no classroom ID, cannot determine visibility
    if (!classroomId) return false;

    // Fetch participant emails for the classroom
    const classroomEmails = getClassroomUsersEmails(classroomId);
    const hasSufficientClassroomEmails = classroomEmails.length > 2;
    const instanceParticipants = instance.participants ?? [];

    // Identify classroom users who attended the meeting instance
    const classroomUsersPresentsOnInstance = instanceParticipants.filter((participant) =>
        classroomEmails.includes(participant.user_email),
    );

    // Require sufficient classroom participants to consider visibility
    if (!hasSufficientClassroomEmails) {
        return false;
    }

    // Hide instances with very few participants (likely test meetings)
    if (instanceParticipants.length <= 2) {
        return false;
    }

    // Require at least two classroom participants to mark as visible
    return classroomUsersPresentsOnInstance.length >= 2;
};
