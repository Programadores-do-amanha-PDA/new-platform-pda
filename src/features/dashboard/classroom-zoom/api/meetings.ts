"use server";
import { ZoomMeetingPastInstanceT, ZoomMeetingT } from "../types"; 
import axiosZoomInstancie from "./instancie";
import { encodeUUID } from "@/utils/encode-UUID";

// Zoom API supports max 300 participants per page for past meeting participants
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
 * Fetches participants for a past meeting with comprehensive pagination support.
 *
 * @param meetingId - The meeting ID (should be already encoded)
 * @param ZOOM_ACCESS_TOKEN - Zoom API access token
 * @returns Array of meeting participants
 */
export const getPastedMeetingParticipants = async (
  meetingId: string,
  ZOOM_ACCESS_TOKEN: string
) => {
  try {
    const participants = [];
    let nextPageToken: string | undefined;
    let pageCount = 0;
    const maxPages = 100; // Safety limit to prevent infinite loops

    do {
      pageCount++;

      const requestParams: Record<string, string | number> = {
        page_size: DEFAULT_PAGE_SIZE,
      };

      if (nextPageToken) {
        requestParams.next_page_token = nextPageToken;
      }

      const response = await axiosZoomInstancie.get(
        `/past_meetings/${meetingId}/participants`,
        {
          headers: {
            Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          params: requestParams,
          timeout: 30000, // 30 second timeout
        }
      );

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = response.data;

      // Validate response structure
      if (!responseData.participants) {
        console.error(
          `[Zoom API] No participants field in response for page ${pageCount}`
        );
        if (pageCount === 1) {
          // If first page has no participants field, it might be an error
          console.error(`[Zoom API] Invalid response structure:`, responseData);
          throw new Error("Invalid API response: missing participants field");
        }
        break;
      }

      if (!Array.isArray(responseData.participants)) {
        console.error(
          `[Zoom API] Participants is not an array on page ${pageCount}:`,
          typeof responseData.participants
        );
        throw new Error("Invalid API response: participants is not an array");
      }

      // Add participants from this page
      const pageParticipants = responseData.participants.filter(Boolean);
      participants.push(...pageParticipants);

      // Update pagination token
      nextPageToken = responseData.next_page_token;

      // Safety checks
      if (pageCount >= maxPages) {
        console.error(
          `[Zoom API] Reached maximum page limit (${maxPages}), stopping pagination`
        );
        break;
      }

      // Additional safety: if we get an empty page, stop
      if (pageParticipants.length === 0 && !nextPageToken) {
        break;
      }
    } while (nextPageToken && nextPageToken.trim() !== "");

    const totalParticipants = participants.length;

    // Final validation
    if (totalParticipants === 0) {
      console.error(`[Zoom API] No participants found for meeting ${meetingId}`);
    }

    return participants;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `[Zoom API] Error fetching participants for meeting ${meetingId}:`,
      errorMessage
    );

    // Enhanced error logging
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: {
          status: number;
          statusText: string;
          data: unknown;
          headers: unknown;
        };
      };
      console.error(`[Zoom API] HTTP Error Details:`, {
        status: axiosError.response.status,
        statusText: axiosError.response.statusText,
        data: axiosError.response.data,
        headers: axiosError.response.headers,
      });

      // Handle specific Zoom API errors
      if (axiosError.response.status === 404) {
        console.error(
          `[Zoom API] Meeting not found or no participants data available`
        );
      } else if (axiosError.response.status === 401) {
        console.error(`[Zoom API] Unauthorized - check access token`);
      } else if (axiosError.response.status === 429) {
        console.error(`[Zoom API] Rate limit exceeded`);
      }
    } else if (error && typeof error === "object" && "request" in error) {
      console.error(
        `[Zoom API] Network Error:`,
        (error as { request: unknown }).request
      );
    }

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

    return response.data.polls;
  } catch (error) {
    console.error(error);
    // If meeting polls are disabled (code 4400), return null instead of throwing
    const { response } = error as { response: { data: { code: number } } };
    if (response?.data?.code === 4400) {
      console.error("Meeting polls disabled for this account");
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
