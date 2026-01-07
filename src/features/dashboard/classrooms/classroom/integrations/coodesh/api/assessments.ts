"use server";

import axios from "axios";
import { CoodeshAssessmentPayload, CoodeshAssessmentsList } from "../types";

const axiosInstance = axios.create({
    baseURL: "https://api.coodesh.com",
    headers: {
        "X-API-KEY": process.env.COODESH_API_TOKEN,
        "Content-Type": "application/json",
    },
});

export const getCoodeshAssessmentsByAPI = async () => {
    try {
        let totalAssessments: number | undefined;
        const assessments = [] as CoodeshAssessmentPayload[];

        do {
            const response = await axiosInstance.get("/assessments/ats?limit=150");
            if (response.status !== 200) {
                throw new Error("Failed to fetch assessments");
            }

            const assessmentList = response.data as CoodeshAssessmentsList;
            if (!totalAssessments) totalAssessments = assessmentList.total;
            assessments.push(...assessmentList.payload);
        } while (typeof totalAssessments === "number" && assessments.length < totalAssessments);

        return assessments;
    } catch (error) {
        console.error(error);
        return null;
    }
};
