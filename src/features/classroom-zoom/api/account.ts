"use server";
import axios from "axios";
import { logger } from "@/lib/logger";
import axiosZoomInstancie from "./axios-zoom-instancie";

const log = logger.child({ module: "classroom-zoom.api.account" });

/**
 * Safely extracts error details from axios errors without exposing sensitive headers.
 *
 * @param error - The error object to process.
 * @returns Sanitized error object with status and message only.
 */
const getSafeErrorInfo = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        return {
            status: error.response?.status,
            message: error.message,
            operation: "getMeAccount",
        };
    }
    if (error instanceof Error) {
        return {
            message: error.message,
            operation: "getMeAccount",
        };
    }
    return { message: "Unknown error", operation: "getMeAccount" };
};

/**
 * Fetches the authenticated user's Zoom account information.
 *
 * @param ZOOM_ACCESS_TOKEN - The Zoom API access token.
 * @returns The user's Zoom account data.
 * @throws {Error} If the token is missing or the request fails.
 */
export const getMeAccount = async (ZOOM_ACCESS_TOKEN: string) => {
    try {
        if (!ZOOM_ACCESS_TOKEN) throw new Error("No access token provided");
        const response = await axiosZoomInstancie.get("/users/me", {
            headers: {
                Authorization: `Bearer ${ZOOM_ACCESS_TOKEN}`,
            },
        });
        if (response.status !== 200) throw new Error("Failed to fetch account");

        return response.data;
    } catch (error) {
        const safeError = getSafeErrorInfo(error);
        log.error(safeError, "Error fetching Zoom account");
        throw error;
    }
};
