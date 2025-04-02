import axiosZoomInstancie from ".";

export const getMeAccount = async (ZOOM_ACCESS_TOKEN: string) => {
  try {
    const response = await axiosZoomInstancie.get("/users/me", {
      headers: {
        Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
      },
    });
    if (response.status !== 200) throw new Error("Failed to fetch account");

    return response;
  } catch (error) {
    console.error("Error fetching account:", error);
    throw error;
  }
};
