import {
  AuthUserWithProfileT,
  ZoomMeetingPastInstanceT,
  ZoomMeetingT,
} from "@/types";

export function calculateClassPresence(
  meeting: ZoomMeetingT | ZoomMeetingPastInstanceT,
  users: Partial<AuthUserWithProfileT>[]
): number {
  if (!meeting.participants || meeting.participants.length === 0) {
    return 0;
  }

  const presentUsers = users.filter((user) => {
    return meeting.participants?.some((participant) => {
      const emailMatch = participant.user_email === user.email;
      const userIdMatch = participant.user_id === user.id;
      return emailMatch || userIdMatch;
    });
  });

  const presencePercentage = (presentUsers.length / users.length) * 100;
  return Math.round((presencePercentage * 100) / 100);
}
