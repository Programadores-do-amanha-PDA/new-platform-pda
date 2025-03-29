import axiosZoomInstancie from ".";

export const getAllMeetings = async () => {
  try {
    const response = await axiosZoomInstancie.get("/users/__USERID__/meeting");
    if (response.status !== 200) throw new Error("Failed to fetch meetings");

    return response;
  } catch (error) {
    console.error("Error fetching meetings:", error);
    throw error;
  }
};

export const getPastedMeetingParticipants = async (meetingId: string) => {
  try {
    const response = await axiosZoomInstancie.get(
      `/past_meetings/${meetingId}/participants`
    );
    if (response.status !== 200)
      throw new Error("Failed to fetch participants");
    return response;
  } catch (error) {
    console.error("Error fetching participants:", error);
    throw error;
  }
};

export const getPastedMeetingDetails = async (meetingId: string) => {
  try {
    const response = await axiosZoomInstancie.get(
      `/past_meetings/${meetingId}`
    );
    if (response.status !== 200)
      throw new Error("Failed to fetch meeting details");
    return response;
  } catch (error) {
    console.error("Error fetching meeting details:", error);
    throw error;
  }
};

export const getMeetingsPolls = async (meetingId: string) => {
  try {
    const response = await axiosZoomInstancie.get(
      `/meetings/${meetingId}/polls`
    );
    if (response.status !== 200) throw new Error("Failed to fetch polls");
    return response;
  } catch (error) {
    console.error("Error fetching polls:", error);
    throw error;
  }
};

export const getPastMeetingsPollResults = async (meetingId: string) => {
  try {
    const response = await axiosZoomInstancie.get(
      `/past_meetings/${meetingId}/polls/`
    );
    if (response.status !== 200)
      throw new Error("Failed to fetch poll results");
    return response;
  } catch (error) {
    console.error("Error fetching poll results:", error);
    throw error;
  }
};
