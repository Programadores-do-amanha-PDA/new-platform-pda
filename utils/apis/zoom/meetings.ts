"use server";
import axiosZoomInstancie from ".";

export const getAllMeetings = async (ZOOM_ACCESS_TOKEN: string) => {
  try {
    const response = await axiosZoomInstancie.get("/users/me/meeting", {
      headers: {
        Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
      },
    });
    if (response.status !== 200) throw new Error("Failed to fetch meetings");

    return response.data;
  } catch (error) {
    console.error("Error fetching meetings:", error);
    throw error;
  }
};

export const getPastedMeetingDetails = async (
  meetingId: string,
  ZOOM_ACCESS_TOKEN: string
) => {
  try {
    const response = await axiosZoomInstancie.get(
      `/past_meetings/${meetingId}`,
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

export const getPastedMeetingParticipants = async (
  meetingId: string,
  ZOOM_ACCESS_TOKEN: string
) => {
  try {
    const response = await axiosZoomInstancie.get(
      `/past_meetings/${meetingId}/participants`,
      {
        headers: {
          Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
        },
      }
    );
    if (response.status !== 200)
      throw new Error("Failed to fetch participants");
    return response.data;
  } catch (error) {
    console.error("Error fetching participants:", error);
    throw error;
  }
};

export const getMeetingsPolls = async (
  meetingId: string,
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
    return response.data;
  } catch (error) {
    console.error("Error fetching polls:", error);
    throw error;
  }
};

export const getPastMeetingsPollResults = async (
  meetingId: string,
  ZOOM_ACCESS_TOKEN: string
) => {
  try {
    const response = await axiosZoomInstancie.get(
      `/past_meetings/${meetingId}/polls/`,
      {
        headers: {
          Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
        },
      }
    );
    if (response.status !== 200)
      throw new Error("Failed to fetch poll results");
    return response.data;
  } catch (error) {
    console.error("Error fetching poll results:", error);
    throw error;
  }
};
