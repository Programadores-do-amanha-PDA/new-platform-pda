"use server";
import {
  ZoomMeetingPastInstancesType,
  ZoomMeetingOccurrenceType,
} from "../../../types/zoom/meetings";
import { ZoomMeetingType } from "@/types/zoom/meetings";
import axiosZoomInstancie from ".";
import { encodeUUID } from "@/utils/encode-UUID";

const DEFAULT_PAGE_SIZE = 10000;

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

    return meetings;
  } catch (error) {
    console.error("Error fetching meetings:", error);
    throw error;
  }
};

/**
 * Fetches detailed information about a specific meeting, including past instances.
 */
export const getMeetingById = async (
  meetingId: string,
  ZOOM_ACCESS_TOKEN: string
) => {
  try {
    const encodedMeetingId = encodeUUID(meetingId);
    const response = await axiosZoomInstancie.get(
      `/meetings/${encodedMeetingId}`,
      {
        headers: {
          Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error("Failed to fetch meeting details");
    }

    const meetingPolls = await getPastMeetingPolls(
      encodedMeetingId,
      ZOOM_ACCESS_TOKEN
    );

    const meetingData = {
      ...response.data,
      occurrences: response.data.occurrences
        ? response.data.occurrences.map((o: ZoomMeetingOccurrenceType) => ({
            ...o,
            is_visible_on_schedule: true,
          }))
        : [],
      polls: meetingPolls.polls,
    } as ZoomMeetingType;

    if (meetingData.type === 8) {
      // Recurring meeting type
      const pastInstances = await getPastMeetingInstances(
        encodedMeetingId,
        ZOOM_ACCESS_TOKEN
      );
      meetingData.past_instances = [];

      for (const instance of pastInstances) {
        const processedInstance = {
          ...instance,
          participants: await getPastedMeetingParticipants(
            instance.uuid,
            ZOOM_ACCESS_TOKEN
          ),
          poll_results: await getPastMeetingsPollResults(
            instance.uuid,
            ZOOM_ACCESS_TOKEN
          ),
        };
        meetingData.past_instances.push(processedInstance);
      }
    }

    return meetingData;
  } catch (error) {
    console.error("Error fetching meeting details:", error);
    throw error;
  }
};

/**
 * Fetches past meeting instances for a recurring meeting.
 */
export const getPastMeetingInstances = async (
  meetingId: string,
  ZOOM_ACCESS_TOKEN: string
) => {
  try {
    const encodedMeetingId = encodeUUID(meetingId);
    const response = await axiosZoomInstancie.get(
      `/past_meetings/${encodedMeetingId}/instances`,
      {
        headers: {
          Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
        },
        params: { page_size: DEFAULT_PAGE_SIZE },
      }
    );
    return (response.data.meetings as ZoomMeetingPastInstancesType[]) || [];
  } catch (error) {
    console.error("Error fetching past meeting instances:", error);
    return [];
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
    const response = await axiosZoomInstancie.get(
      `/past_meetings/${encodedMeetingId}/participants`,
      {
        headers: {
          Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
        },
        params: { page_size: DEFAULT_PAGE_SIZE },
      }
    );
    if (response.status !== 200)
      throw new Error("Failed to fetch participants");

    return response.data.participants;
  } catch (error) {
    console.error("Error fetching participants:", error);
    throw error;
  }
};

/**
 * Fetches polls for a meeting.
 */
export const getPastMeetingPolls = async (
  meetingId: string,
  ZOOM_ACCESS_TOKEN: string
) => {
  try {
    const encodedMeetingId = encodeUUID(meetingId);
    const response = await axiosZoomInstancie.get(
      `/meetings/${encodedMeetingId}/polls`,
      {
        headers: {
          Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
        },
        params: { page_size: DEFAULT_PAGE_SIZE },
      }
    );
    if (response.status !== 200) throw new Error("Failed to fetch polls");
    return response.data;
  } catch (error) {
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
        params: { page_size: DEFAULT_PAGE_SIZE },
      }
    );
    if (response.status !== 200)
      throw new Error("Failed to fetch poll results");
    return response.data.questions;
  } catch (error) {
    console.error("Error fetching poll results:", error);
    throw error;
  }
};
