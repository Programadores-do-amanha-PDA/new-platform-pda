"use server";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://api.coodesh.com",
  headers: {
    "X-API-KEY": process.env.NEXT_PUBLIC_COODESH_API_TOKEN,
    "Content-Type": "application/json",
  },
});

const getCoodeshAPIAssessments = async () => {
  try {
    const response = await axiosInstance.get("/assessments/ats");
    if (response.status !== 200) {
      throw new Error("Failed to fetch assessments");
    }

    return response;
  } catch (error) {
    console.error(error);
    throw false;
  }
};

export { getCoodeshAPIAssessments };
