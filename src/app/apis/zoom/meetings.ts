"use server";
import { ZoomMeetingPastInstanceT, ZoomMeetingT } from "@/types/classroom-zoom";
import axiosZoomInstancie from ".";
import { encodeUUID } from "@/utils/encode-UUID";

const DEFAULT_PAGE_SIZE = 300;

/**
 * Fetches all meetings for the current user.
 */
export const getAllMeetingsByAccount = async (ZOOM_ACCESS_TOKEN: string) => {
  try {
    const meetings = [];
    let nextPageToken: string | undefined;

    do {
      const response = await axiosZoomInstancie.get("/users/me/meetings", {
        headers: {
          Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
        },
        params: nextPageToken
          ? { next_page_token: nextPageToken, page_size: DEFAULT_PAGE_SIZE }
          : { page_size: DEFAULT_PAGE_SIZE },
      });

      if (response.status !== 200) throw new Error("Failed to fetch meetings");

      meetings.push(...response.data.meetings);
      nextPageToken = response.data.next_page_token;
    } while (nextPageToken);

    return meetings.flatMap((meeting) => {
      const { id, ...restMeetingData }: ZoomMeetingT = meeting;

      return {
        ...restMeetingData,
        meeting_id: Number(id),
      } as Omit<ZoomMeetingT, "id">;
    }) as Omit<ZoomMeetingT, "id">[];
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return null;
  }
};

/**
 * Fetches detailed information about a specific meeting, including past instances.
 */
export const getMeetingById = async (
  meetingId: number,
  ZOOM_ACCESS_TOKEN: string
) => {
  try {
    const response = await axiosZoomInstancie.get(`/meetings/${meetingId}`, {
      headers: {
        Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
      },
    });

    if (response.status !== 200) {
      throw new Error("Failed to fetch meeting details");
    }

    const meetingPolls = await getPastMeetingPolls(
      meetingId,
      ZOOM_ACCESS_TOKEN
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, ...restMeetingData }: ZoomMeetingT = response.data;

    return {
      ...restMeetingData,
      meeting_id: Number(id),
      polls: meetingPolls,
    } as Omit<ZoomMeetingT, "id">;
  } catch (error) {
    console.error("Error fetching meeting details:", error);
    return null;
  }
};

/**
 * Fetches past meeting instances for a recurring meeting.
 */
export const getPastMeetingInstances = async (
  meetingId: number,
  ZOOM_ACCESS_TOKEN: string
) => {
  try {
    const response = await axiosZoomInstancie.get(
      `/past_meetings/${meetingId}/instances`,
      {
        headers: {
          Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
        },
      }
    );
    return (
      (response.data.meetings?.filter(Boolean) as ZoomMeetingPastInstanceT[]) ||
      []
    );
  } catch (error) {
    console.error("Error fetching past meeting instances:", error);
    return null;
  }
};

/**
 * Fetches details for a past meeting.
 */
export const getPastedMeetingDetails = async (
  meetingId: string,
  ZOOM_ACCESS_TOKEN: string
) => {
  try {
    const encodedMeetingId = encodeUUID(meetingId);
    const response = await axiosZoomInstancie.get(
      `/past_meetings/${encodedMeetingId}`,
      {
        headers: {
          Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
        },
      }
    );
    if (response.status !== 200)
      throw new Error("Failed to fetch meeting details");
    return response.data;
  } catch (error) {
    console.error("Error fetching meeting details:", error);
    throw error;
  }
};

/**
 * Fetches participants for a past meeting.
 */
export const getPastedMeetingParticipants = async (
  meetingId: string,
  ZOOM_ACCESS_TOKEN: string
) => {
  try {
    const encodedMeetingId = encodeUUID(meetingId);

    const participants = [];
    let nextPageToken: string | undefined;

    do {
      const response = await axiosZoomInstancie.get(
        `/past_meetings/${encodedMeetingId}/participants`,
        {
          headers: {
            Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
          },
          params: nextPageToken
            ? { next_page_token: nextPageToken, page_size: DEFAULT_PAGE_SIZE }
            : { page_size: DEFAULT_PAGE_SIZE },
        }
      );

      if (response.status !== 200)
        throw new Error("Failed to fetch participants");

      participants.push(...response.data.participant);
      nextPageToken = response.data.next_page_token;
    } while (nextPageToken);

    return participants?.filter(Boolean);
  } catch (error) {
    console.error("Error fetching participants:", error);
    throw error;
  }
};

/**
 * Fetches polls for a meeting.
 */
export const getPastMeetingPolls = async (
  meetingId: number,
  ZOOM_ACCESS_TOKEN: string
) => {
  try {
    const response = await axiosZoomInstancie.get(
      `/meetings/${meetingId}/polls`,
      {
        headers: {
          Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
        },
      }
    );
    if (response.status !== 200) throw new Error("Failed to fetch polls");

    console.log(response);
    return response.data.polls;
  } catch (error) {
    console.error(error);
    // If meeting polls are disabled (code 4400), return null instead of throwing
    const { response } = error as { response: { data: { code: number } } };
    if (response?.data?.code === 4400) {
      console.warn("Meeting polls disabled for this account");
      return { polls: [] };
    }
    console.error("Error fetching polls:", error);
    throw error;
  }
};

/**
 * Fetches poll results for a past meeting.
 */
export const getPastMeetingsPollResults = async (
  meetingId: string,
  ZOOM_ACCESS_TOKEN: string
) => {
  try {
    const encodedMeetingId = encodeUUID(meetingId);
    const response = await axiosZoomInstancie.get(
      `/past_meetings/${encodedMeetingId}/polls`,
      {
        headers: {
          Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
        },
      }
    );
    if (response.status !== 200)
      throw new Error("Failed to fetch poll results");
    return response.data.questions?.filter(Boolean);
  } catch (error) {
    console.error("Error fetching poll results:", error);
    throw error;
  }
};
