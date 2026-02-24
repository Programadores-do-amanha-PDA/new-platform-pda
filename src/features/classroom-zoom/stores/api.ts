import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { getMeAccount } from "../api/account";
import {
    getAllMeetingsByAccount,
    getMeetingById,
    getPastedMeetingDetails,
    getPastMeetingInstances,
    getPastedMeetingParticipants,
    getPastMeetingsPollResults,
} from "../api/meetings";
import { getAccessToken } from "../api/oauth";
import { ZoomAccountMeT } from "../types/accounts";
import { ZoomAPIStateT, ZoomAPIActionsT } from "../types/api";
import { ZoomMeeting, ZoomMeetingWithPastInstancies, ZoomMeetingParticipant, ZoomMeetingPollResultsT } from "../types/meetings";
import { ZoomMeetingPastInstance } from "../types/past-instances";
import { validateZoomAccount } from "../utils/meeting-store-utils";
import { RECURRING_MEETING_TYPES, NON_RECURRING_MEETING_TYPES } from "../utils/meeting-utils";
import { logger } from "@/lib/logger";

const initialState: ZoomAPIStateT = {
    meetingsByAPI: [],
    loading: false,
};

const log = logger.child({ module: "ZoomAPIStore" });

export const useZoomAPIStore = create<ZoomAPIStateT & ZoomAPIActionsT>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setMeetingsByAPI: (meetingsByAPI) => set({ meetingsByAPI }),

            getZoomMeAccountDataByAPI: async (account, forceRefresh = false) => {
                try {
                    if (!validateZoomAccount(account)) throw new Error("Invalid account data");

                    const ZOOM_ACCESS_TOKEN = await getAccessToken(account, forceRefresh);
                    if (!ZOOM_ACCESS_TOKEN) {
                        throw new Error("Failed to get access token");
                    }

                    const meAccount = await getMeAccount(ZOOM_ACCESS_TOKEN);
                    if (!meAccount) throw new Error("no me account response from API");

                    return meAccount as Partial<ZoomAccountMeT>;
                } catch (error) {
                    log.error(
                        { err: error, operation: "get_zoom_me_account_data_by_api" },
                        "Error fetching me account data by API",
                    );
                    return false;
                }
            },

            getAllMeetingsByAPI: async (account) => {
                try {
                    if (!validateZoomAccount(account)) throw new Error("Invalid account data");

                    set({ loading: true });

                    const accessData = {
                        account_id: account.account_id,
                        client_id: account.client_id,
                        client_secret: account.client_secret,
                    };

                    const ZOOM_ACCESS_TOKEN = await getAccessToken(accessData, true);
                    if (!ZOOM_ACCESS_TOKEN) {
                        throw new Error("Failed to get access token");
                    }

                    const meetings = await getAllMeetingsByAccount(ZOOM_ACCESS_TOKEN);
                    if (!meetings) throw new Error("no meetings response from API");

                    const newMeetings = meetings.map((meeting) => ({
                        ...meeting,
                        account_id: account.id,
                    })) as ZoomMeeting[];

                    set((state) => {
                        // Create a map of existing meetings by UUID for faster lookup
                        const existingMeetingsMap = new Map(
                            state.meetingsByAPI
                                .filter((meeting) => meeting.account_id === account.id)
                                .map((meeting) => [meeting.uuid, meeting]),
                        );

                        // Filter only truly new meetings to prevent duplicates
                        const uniqueNewMeetings = newMeetings.filter((meeting) => !existingMeetingsMap.has(meeting.uuid));

                        // Keep meetings from other accounts unchanged
                        const meetingsFromOtherAccounts = state.meetingsByAPI.filter(
                            (meeting) => meeting.account_id !== account.id,
                        );

                        // Only update if there are actually new meetings to prevent unnecessary re-renders
                        if (uniqueNewMeetings.length === 0) {
                            return state; // No changes needed
                        }

                        return {
                            meetingsByAPI: [
                                ...meetingsFromOtherAccounts,
                                ...Array.from(existingMeetingsMap.values()), // Keep existing meetings from this account
                                ...uniqueNewMeetings, // Add only new meetings
                            ],
                        };
                    });
                    return true;
                } catch (error) {
                    log.error({ err: error, operation: "get_all_meetings_by_api" }, "Error fetching meetings");
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            getMeetingByAPI: async (account, meetingData) => {
                try {
                    if (!validateZoomAccount(account)) throw new Error("Account data is missing");
                    if (!meetingData.meeting_id || !meetingData.uuid) throw new Error("Meeting data is missing");

                    set({ loading: true });

                    const accessData = {
                        account_id: account.account_id,
                        client_id: account.client_id,
                        client_secret: account.client_secret,
                    };

                    const ZOOM_ACCESS_TOKEN = await getAccessToken(accessData);
                    if (!ZOOM_ACCESS_TOKEN) {
                        throw new Error("Failed to get access token");
                    }

                    const meetingDuration = (meetingData.duration || 0) * 60000;
                    const meetingEndTime = new Date(new Date(meetingData.start_time!).getTime() + meetingDuration).getTime();
                    const now = Date.now();

                    let meeting;

                    // Decide which API endpoint to use based on meeting status and type
                    if (meetingEndTime <= now || (RECURRING_MEETING_TYPES as readonly number[]).includes(meetingData.type!)) {
                        meeting = await getMeetingById(meetingData.meeting_id, ZOOM_ACCESS_TOKEN);
                    } else if (meetingEndTime > now) {
                        meeting = await getPastedMeetingDetails(meetingData.uuid, ZOOM_ACCESS_TOKEN);
                    }
                    if (!meeting) {
                        throw new Error("No meetingData data returned from API");
                    }

                    // processing recurrence or non recurrence meeting data
                    const meetingDataProcessed: Omit<ZoomMeeting, "id" | "created_at"> = {
                        ...meeting,
                        participants: [],
                        poll_results: [],
                        account_id: account.id,
                    };

                    // if meeting type is a non recurrence
                    if ((NON_RECURRING_MEETING_TYPES as readonly number[]).includes(meetingData.type!)) {
                        // if is not a past meeting
                        if (meetingEndTime >= now) {
                            return meetingDataProcessed;
                        }
                        // if is a past meeting
                        else if (meetingEndTime < now) {
                            const [participants, pollResults] = await Promise.all([
                                get().getAllParticipantsByMeetingIdFromAPI(account, meetingData.meeting_id),
                                get().getAllPollResultsByMeetingIdFromAPI(account, meetingData.meeting_id),
                            ]);

                            meetingDataProcessed["participants"] = participants || [];
                            meetingDataProcessed["poll_results"] = pollResults || [];

                            return meetingDataProcessed;
                        }
                    }
                    // if meeting type is a recurrence
                    else if ((RECURRING_MEETING_TYPES as readonly number[]).includes(meetingData.type!)) {
                        const allPastInstances = await getPastMeetingInstances(meeting.meeting_id, ZOOM_ACCESS_TOKEN);
                        if (!allPastInstances) throw new Error("No past instances data returned from API");

                        return {
                            ...meetingDataProcessed,
                            past_instances: allPastInstances.map((instance) => ({
                                ...instance,
                                participants: [],
                                poll_results: [],
                                justifications: [],
                                account_id: account.id,
                            })),
                        } as Omit<ZoomMeetingWithPastInstancies, "id" | "created_at">;
                    }

                    return {
                        ...meetingData,
                        account_id: account.id,
                    } as ZoomMeeting;
                } catch (error) {
                    console.error("Error fetching Zoom meeting data:");
                    if (error instanceof Error) console.error(error);
                    return null;
                } finally {
                    set({ loading: false });
                }
            },

            getAllParticipantsByMeetingIdFromAPI: async (account, meetingId) => {
                try {
                    // Validate account data
                    if (!validateZoomAccount(account)) throw new Error("Invalid account data");
                    // Validate meeting ID
                    if (!meetingId) throw new Error("Meeting ID is missing");

                    set({ loading: true });

                    const accessData = {
                        account_id: account.account_id,
                        client_id: account.client_id,
                        client_secret: account.client_secret,
                    };

                    // Get access token
                    const ZOOM_ACCESS_TOKEN = await getAccessToken(accessData);
                    if (!ZOOM_ACCESS_TOKEN) {
                        throw new Error("Failed to get access token");
                    }

                    // Double encode the meeting ID for Zoom API compatibility
                    const encodedMeetingId = encodeURIComponent(encodeURIComponent(meetingId));

                    // Fetch participants from Zoom API
                    const participants = await getPastedMeetingParticipants(encodedMeetingId, ZOOM_ACCESS_TOKEN);

                    if (!participants || !Array.isArray(participants)) {
                        log.info({ participants, meetingId }, "Invalid participants data from API");
                        throw new Error("Invalid participants data from API");
                    }

                    return participants as ZoomMeetingParticipant[];
                } catch (error) {
                    log.error(
                        { err: error, operation: "getAllParticipantsByMeetingIdFromAPI" },
                        "Error fetching participants by meeting ID",
                    );
                    return [];
                }
            },

            getAllPollResultsByMeetingIdFromAPI: async (account, meetingId) => {
                try {
                    if (!validateZoomAccount(account)) throw new Error("Invalid account data");
                    if (!meetingId) throw new Error("Meeting ID is missing");

                    set({ loading: true });

                    const accessData = {
                        account_id: account.account_id,
                        client_id: account.client_id,
                        client_secret: account.client_secret,
                    };
                    const ZOOM_ACCESS_TOKEN = await getAccessToken(accessData);
                    if (!ZOOM_ACCESS_TOKEN) {
                        throw new Error("Failed to get access token");
                    }

                    // Double encode the meeting ID for Zoom API compatibility
                    const encodedMeetingId = encodeURIComponent(encodeURIComponent(meetingId));

                    const pollResults = await getPastMeetingsPollResults(encodedMeetingId, ZOOM_ACCESS_TOKEN);
                    if (!pollResults || !Array.isArray(pollResults)) {
                        throw new Error("Invalid poll results data from API");
                    }

                    // Filter out any null or undefined entries from the poll results
                    const nonNullablePollResults = pollResults.filter(Boolean) as ZoomMeetingPollResultsT[];
                    return nonNullablePollResults;
                } catch (error) {
                    log.error({ err: error, operation: "getAllPollResultsByMeetingIdFromAPI" }, "Error fetching poll results");
                    return [];
                }
            },

            getAllPastInstanciesByMeetingIdFromAPI: async (account, meetingId) => {
                try {
                    if (!account.account_id) throw new Error("Account ID is missing");
                    if (!account.id) throw new Error("Account ID is missing");
                    if (!account.client_id) throw new Error("Client ID is missing");
                    if (!account.client_secret) throw new Error("Client Secret is missing");
                    if (!meetingId) throw new Error("Meeting ID is missing");

                    set({ loading: true });

                    const accessData = {
                        account_id: account.account_id,
                        client_id: account.client_id,
                        client_secret: account.client_secret,
                    };

                    const ZOOM_ACCESS_TOKEN = await getAccessToken(accessData);
                    if (!ZOOM_ACCESS_TOKEN) {
                        throw new Error("Failed to get access token");
                    }

                    const pastInstances = await getPastMeetingInstances(meetingId, ZOOM_ACCESS_TOKEN);

                    if (!pastInstances || !Array.isArray(pastInstances)) {
                        throw new Error("Invalid past instances data from API");
                    }

                    return pastInstances as ZoomMeetingPastInstance[];
                } catch (error) {
                    log.error(
                        { err: error, operation: "getAllPastInstanciesByMeetingIdFromAPI" },
                        "Error fetching past meeting instances",
                    );
                    return [];
                } finally {
                    set({ loading: false });
                }
            },

            reset: () => {
                set(initialState);
            },
        }),
        { name: "ZoomAPIStore" },
    ),
);
