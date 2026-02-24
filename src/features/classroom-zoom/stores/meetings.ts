import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
    getAllZoomMeetingsByClassroomId,
    getZoomMeetingById,
    createZoomMeetingByClassroomId,
    updateZoomMeetingById,
    deleteZoomMeetingById,
} from "../actions/meetings";
import {
    ZoomMeetingState,
    ZoomMeetingActions,
    ZoomMeetingWithPastInstancies,
    ZoomMeetingOccurrenceT,
    ZoomMeeting,
    ZoomMeetingActionsMeetingPickT,
} from "../types/meetings";
import { validateZoomAccount, calculateVisibility, validateMeeting } from "../utils/meeting-store-utils";
import { RECURRING_MEETING_TYPES, NON_RECURRING_MEETING_TYPES } from "../utils/meeting-utils";
import { useZoomAPIStore } from "./api";
import { useZoomMeetingPastInstanceStore } from "./past-instances";
import { logger } from "@/lib/logger";

const initialState: ZoomMeetingState = {
    meetings: [],
    loading: false,
};

const log = logger.child({ module: "ZoomMeetingStore" });

export const useZoomMeetingStore = create<ZoomMeetingState & ZoomMeetingActions>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setMeetings: (meetings) => set({ meetings }),

            getAllMeetings: async (classroomId) => {
                try {
                    // Validating classroom ID
                    if (!classroomId) throw new Error("Classroom ID is required");

                    // Fetching meetings from API
                    set({ loading: true });
                    const meetingsResponse = await getAllZoomMeetingsByClassroomId(classroomId);
                    if (!meetingsResponse) throw "no meetings response";

                    set({ meetings: meetingsResponse });
                    return true;
                } catch (error) {
                    if (error instanceof Error) console.error(error);
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            getMeetingById: async (meetingId) => {
                try {
                    // Validating meeting ID
                    if (!meetingId) throw new Error("Meeting ID is required");

                    // Fetching meeting by ID from API
                    set({ loading: true });
                    const meetingResponse = await getZoomMeetingById(meetingId);
                    if (!meetingResponse) throw "no meeting response";

                    return meetingResponse;
                } catch (error) {
                    if (error instanceof Error) console.error(error);
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            createMeeting: async (account, meetingData) => {
                try {
                    // Validating the account data before proceeding with API
                    if (!validateZoomAccount(account)) {
                        throw new Error("Account data is missing");
                    }
                    // Validating the meeting data before proceeding with API
                    if (!meetingData.meeting_id || !meetingData.uuid) {
                        throw new Error("Meeting data is missing");
                    }

                    // Initializing zoom api store
                    const zoomApiStore = useZoomAPIStore.getState();

                    // Fetch the meeting details from Zoom API
                    const meetingResponse = await zoomApiStore.getMeetingByAPI(account, meetingData);
                    if (!meetingResponse) throw new Error("no meeting response");

                    // Check if meeting is recurrent
                    if ((RECURRING_MEETING_TYPES as readonly number[]).includes(meetingResponse.type)) {
                        // Saving meeting with past instances
                        const meetingWithPastInstances = meetingResponse as Omit<
                            ZoomMeetingWithPastInstancies,
                            "id" | "created_at"
                        >;

                        // Extract past instances and rest of meeting data
                        const { past_instances, ...restOfMeeting } = meetingWithPastInstances;

                        const newMeeting = await createZoomMeetingByClassroomId({
                            ...meetingData,
                            synchronized_at: new Date().toISOString(),
                            ...restOfMeeting,
                            classroom_id: account?.classroom_id,
                        });
                        if (!newMeeting || !newMeeting.id) {
                            throw new Error("Falha ao criar reunião no banco de dados");
                        }

                        // create all past instancies if exists
                        if (past_instances && past_instances.length > 0) {
                            // Accessing past instance store for creating instances
                            const pastInstanceStore = useZoomMeetingPastInstanceStore.getState();

                            // Process past instances with participants and poll results
                            const pastInstancesData = past_instances.map((instance) => {
                                // Get classroom participants for visibility logic
                                const instanceParticipants = instance.participants ?? [];
                                const isInstanceMustBeVisible = calculateVisibility(
                                    {
                                        participants: instanceParticipants,
                                        is_visible_on_schedule: instance.is_visible_on_schedule,
                                    },
                                    account.classroom_id!,
                                );

                                return {
                                    classroom_id: account.classroom_id!,
                                    account_id: account.id!,
                                    meeting_id: newMeeting.id,
                                    uuid: instance.uuid!,
                                    start_time: instance.start_time,
                                    class_type: instance.class_type,
                                    participants: instance.participants || [],
                                    poll_results: instance.poll_results || [],
                                    justifications: instance.justifications || [],
                                    is_visible_on_schedule: isInstanceMustBeVisible,
                                };
                            });

                            await pastInstanceStore.createMultiplePastInstances(pastInstancesData);
                        }

                        set((state) => ({ meetings: [newMeeting, ...state.meetings] }));
                        return newMeeting.id as string;
                    }
                    // Check if meeting is non-recurrent
                    else if ((NON_RECURRING_MEETING_TYPES as readonly number[]).includes(meetingResponse.type)) {
                        // Create the meeting on Supabase
                        const newMeeting = await createZoomMeetingByClassroomId({
                            ...meetingData,
                            synchronized_at: new Date().toISOString(),
                            classroom_id: account?.classroom_id,
                        });
                        if (!newMeeting) throw new Error("no meeting create response");

                        set({ meetings: [newMeeting, ...get().meetings] });
                        return newMeeting.id as string;
                    }
                } catch (error) {
                    if (error instanceof Error)
                        log.error({ err: error, operation: "create_meeting" }, "Error creating meeting");
                    return false;
                }
            },

            updateMeeting: async (meetingId, updates) => {
                try {
                    if (!meetingId || !updates) {
                        throw new Error("id and updates fields are required");
                    }

                    // update meeting on Supabase by ID
                    const updatedMeeting = await updateZoomMeetingById(meetingId, updates);
                    if (!updatedMeeting) throw new Error("no update meeting response");

                    // Updating the meeting in the store
                    set((state) => ({
                        meetings: state.meetings.map((meeting) => (meeting.id === meetingId ? updatedMeeting : meeting)),
                    }));

                    return true;
                } catch (error) {
                    if (error instanceof Error)
                        log.error({ err: error, operation: "update_meeting" }, "Error updating meeting");
                    return false;
                }
            },

            refreshAllMeetingOccurrenceByMeetingId: async (account, meeting, currentOccurrencesUpdated) => {
                try {
                    // Checking the required fields
                    if (!validateMeeting(meeting) || !validateZoomAccount(account)) {
                        throw new Error("id and updates fields are required");
                    }

                    // Fetching the current meeting to ensure it exists
                    const currentMeeting = get().meetings.find((meeting) => meeting.id === meeting.id);
                    if (!currentMeeting) {
                        throw new Error("Meeting not found");
                    }

                    // If no occurrences were passed, we fetch the meeting from the API to get the latest occurrences
                    let updatedOccurrences: ZoomMeetingOccurrenceT[] = [];
                    if (!Array.isArray(currentOccurrencesUpdated)) {
                        //  Initializing zoom api store
                        const zoomAPIStore = useZoomAPIStore.getState();

                        // Updating the specific occurrence within the meeting
                        const fetchedMeeting = await zoomAPIStore.getMeetingByAPI(account, meeting);
                        if (!fetchedMeeting) throw new Error("no meeting response from API");

                        // Extracting the occurrences from the fetched meeting
                        const { occurrences } = fetchedMeeting;

                        // Using the fetched occurrences if available
                        if (Array.isArray(occurrences)) {
                            updatedOccurrences = occurrences;
                        }
                    }
                    // If occurrences were passed, we use them directly
                    else if (Array.isArray(currentOccurrencesUpdated)) {
                        updatedOccurrences = currentMeeting.occurrences || [];
                    }

                    // Updating the meeting with the new occurrences
                    const updatedMeeting: ZoomMeeting | false = await updateZoomMeetingById(meeting.id, {
                        occurrences: updatedOccurrences,
                    });
                    if (!updatedMeeting) throw new Error("no update meeting response");

                    // Updating the meeting in the store
                    set((state) => ({
                        meetings: state.meetings.map((meeting) => (meeting.id === meeting.id ? updatedMeeting : meeting)),
                    }));

                    return true;
                } catch (error) {
                    log.error(
                        { err: error, operation: "refresh_all_meeting_occurrence_by_meeting_id" },
                        "Error refreshing all meeting occurrences by meeting id",
                    );
                    return false;
                }
            },

            refreshAndUpdateMeeting: async (meeting, account) => {
                try {
                    if (!validateZoomAccount(account)) {
                        throw new Error("Account data is missing");
                    }

                    if (!meeting.id || !meeting.meeting_id || !meeting.uuid || !meeting.start_time || !meeting.duration) {
                        throw new Error("Meeting data is missing");
                    }

                    const currentState = get();

                    const currentMeeting = currentState.meetings.find((m) => m.id === meeting.id);
                    if (!currentMeeting) {
                        throw new Error("Meeting not found in current meetings");
                    }

                    const zoomApiStore = useZoomAPIStore.getState();

                    const updatedMeetingData = await zoomApiStore.getMeetingByAPI(account, meeting);
                    if (!updatedMeetingData) throw new Error("no meeting response");

                    // Check if meeting is recurrent
                    const isRecurrentMeeting =
                        updatedMeetingData && (RECURRING_MEETING_TYPES as readonly number[]).includes(updatedMeetingData.type);

                    // Check if meeting is non-recurrent
                    const isNonRecurrentMeeting =
                        updatedMeetingData &&
                        (NON_RECURRING_MEETING_TYPES as readonly number[]).includes(updatedMeetingData.type);

                    if (isRecurrentMeeting) {
                        await currentState.handleRecurrentMeetingUpdate(
                            meeting as ZoomMeetingActionsMeetingPickT,
                            account,
                            updatedMeetingData as Omit<ZoomMeetingWithPastInstancies, "id" | "created_at">,
                        );
                    } else if (isNonRecurrentMeeting) {
                        await currentState.handleNonRecurrentMeetingUpdate(
                            meeting as ZoomMeetingActionsMeetingPickT,
                            account,
                            updatedMeetingData,
                        );
                    } else {
                        throw new Error("Tipo de reunião inválido ou não suportado");
                    }

                    return true;
                } catch (error) {
                    log.error({ err: error, operation: "refreshAndUpdateMeeting" }, "Error refreshing and updating meeting");
                    return false;
                }
            },

            handleRecurrentMeetingUpdate: async (meeting, account, updatedMeetingData, instanciesUpdateMode = "all") => {
                try {
                    if (!validateZoomAccount(account)) throw new Error("Account data is missing");
                    if (!validateMeeting(meeting)) throw new Error("Meeting ID is required");

                    const currentState = get();
                    const { past_instances, ...restOfMeeting } = updatedMeetingData;

                    const updatedMeeting = await updateZoomMeetingById(meeting.id!, {
                        ...restOfMeeting,
                        occurrences: updatedMeetingData?.occurrences || [],
                        synchronized_at: new Date().toISOString(),
                    });
                    if (!updatedMeeting) throw new Error("no meeting update response");

                    // Handle past instances (both new and existing)
                    if (past_instances && past_instances.length > 0) {
                        // Process new instances
                        if (instanciesUpdateMode === "new") {
                            await currentState.processNewPastInstances(meeting, account, past_instances);
                        }
                        // Update existing (and new fetched by API) instances with fresh data
                        else if (instanciesUpdateMode === "existing" || instanciesUpdateMode === "all") {
                            await currentState.updateExistingPastInstances(meeting.id!, account, past_instances);
                        }
                    }

                    set((state) => ({
                        meetings: state.meetings.map((m) => (m.id === updatedMeeting.id ? updatedMeeting : m)),
                    }));

                    return true;
                } catch (error) {
                    if (error instanceof Error) {
                        log.error(
                            { err: error, operation: "handleRecurrentMeetingUpdate" },
                            "Error handling recurrent meeting update",
                        );
                    }
                    throw error;
                }
            },

            handleNonRecurrentMeetingUpdate: async (meeting, account, updatedMeetingData) => {
                try {
                    if (!validateZoomAccount(account)) throw new Error("Account data is missing");
                    if (!validateMeeting(meeting)) throw new Error("Meeting ID is required");

                    const zoomAPIStore = useZoomAPIStore.getState();

                    const meetingStartTime = new Date(updatedMeetingData.start_time || 0).getTime();
                    const currentTime = Date.now();

                    let finalMeetingData = { ...updatedMeetingData };

                    // If meeting has already happened, fetch participants and poll results
                    if (meetingStartTime < currentTime) {
                        const [participants, pollResults] = await Promise.all([
                            zoomAPIStore.getAllParticipantsByMeetingIdFromAPI(account, meeting.meeting_id!),
                            zoomAPIStore.getAllPollResultsByMeetingIdFromAPI(account, meeting.meeting_id!),
                        ]);

                        finalMeetingData = {
                            ...finalMeetingData,
                            participants: participants || [],
                            poll_results: pollResults || [],
                        };
                    }

                    const updatedMeeting = await updateZoomMeetingById(meeting.id!, {
                        ...finalMeetingData,
                        synchronized_at: new Date().toISOString(),
                    });
                    if (!updatedMeeting) throw new Error("no meeting update response");

                    set((state) => ({
                        meetings: state.meetings.map((m) => (m.id === meeting.id ? updatedMeeting : m)),
                    }));
                } catch (error) {
                    log.error(
                        { err: error, operation: "handleNonRecurrentMeetingUpdate" },
                        "Error handling non-recurrent meeting update",
                    );
                    throw error;
                }
            },

            processNewPastInstances: async (meeting, account, pastInstances) => {
                try {
                    const currentState = get();

                    if (!validateZoomAccount(account)) throw new Error("Account data is missing");
                    if (!validateMeeting(meeting)) throw new Error("Meeting ID is required");
                    if (pastInstances.length === 0) {
                        return;
                    }

                    const zoomPastInstancieStore = useZoomMeetingPastInstanceStore.getState();

                    const existingPastInstances = await zoomPastInstancieStore._getPastInstancesByMeetingId(meeting.id!);
                    if (!existingPastInstances) {
                        throw new Error("Error fetching existing past instances");
                    }

                    // If no existing past instances found, we proceed with all provided instances
                    const currentPastInstances = Array.isArray(existingPastInstances)
                        ? existingPastInstances
                        : zoomPastInstancieStore.pastInstances;

                    // Create a set of existing UUIDs for quick lookup
                    const existingUUIDs = new Set(currentPastInstances.map((instance) => instance.uuid));

                    // Filter only new instances that don't exist in database
                    const newPastInstances = pastInstances.filter((instance) => {
                        return instance.uuid && !existingUUIDs.has(instance.uuid) && instance.uuid.trim() !== "";
                    });
                    if (newPastInstances.length === 0) {
                        return;
                    }

                    const enrichedPastInstances = await currentState.fetchPastInstancesData(account, newPastInstances);

                    // Ensure we have the enriched data
                    if (!enrichedPastInstances) {
                        throw new Error("Error fetching past instances data");
                    }

                    // Process new instances with participants and poll results
                    const pastInstancesData = enrichedPastInstances.map((instance) => {
                        // Get classroom participants for visibility logic
                        const isInstanceMustBeVisible = calculateVisibility(
                            {
                                participants: instance.participants,
                                is_visible_on_schedule: instance.is_visible_on_schedule,
                            },
                            account.classroom_id!,
                        );

                        return {
                            classroom_id: account.classroom_id!,
                            account_id: account.id!,
                            meeting_id: meeting.id!,
                            uuid: instance.uuid!,
                            start_time: instance.start_time,
                            class_type: instance.class_type,
                            participants: instance.participants || [],
                            poll_results: instance.poll_results || [],
                            justifications: instance.justifications || [],
                            synchronized_at: new Date().toISOString(),
                            is_visible_on_schedule: isInstanceMustBeVisible,
                        };
                    });

                    const success = await zoomPastInstancieStore.createMultiplePastInstances(pastInstancesData);
                    if (!success) throw new Error("Error creating new past instances");

                    return;
                } catch (error) {
                    log.error({ err: error, operation: "processNewPastInstances" }, "Error processing new past instances");
                    throw error;
                }
            },

            updateExistingPastInstances: async (meetingId, account, pastInstances) => {
                try {
                    if (!validateZoomAccount(account)) throw new Error("Account data is missing");
                    if (!meetingId) throw new Error("Meeting ID is required");

                    if (pastInstances.length === 0) {
                        return;
                    }

                    const currentState = get();

                    const pastInstanciesStore = useZoomMeetingPastInstanceStore.getState();

                    const existingPastInstances = await pastInstanciesStore._getPastInstancesByMeetingId(meetingId);
                    if (!existingPastInstances) return;

                    if (existingPastInstances.length === 0) {
                        return;
                    }

                    // Determine which instances are existing vs new
                    const currentPastInstances = Array.isArray(existingPastInstances)
                        ? existingPastInstances
                        : pastInstanciesStore.pastInstances;

                    const existingUUIDs = new Set(currentPastInstances.map((instance) => instance.uuid));

                    // Filter only existing instances that need to be updated
                    const existingInstancesToUpdate = pastInstances.filter(
                        (instance) => instance.uuid && existingUUIDs.has(instance.uuid),
                    );

                    // If no existing instances to update, exit early
                    if (existingInstancesToUpdate.length === 0) {
                        return;
                    }

                    // Fetch fresh participants and poll results for existing instances
                    const enrichedPastInstances = await currentState.fetchPastInstancesData(account, existingInstancesToUpdate);
                    if (!enrichedPastInstances) {
                        throw new Error("Error fetching past instances data");
                    }

                    // Process existing instances for update
                    const existingInstancesUpdates = enrichedPastInstances
                        .map((instance) => {
                            // Find the existing instance to preserve justifications
                            const existingInstance = currentPastInstances.find((existing) => existing.uuid === instance.uuid);

                            // If somehow instance not found, skip it
                            if (!existingInstance) return null;

                            // Get classroom participants for visibility logic
                            const instanceParticipants = instance.participants ?? [];
                            const isInstanceMustBeVisible = calculateVisibility(
                                {
                                    participants: instanceParticipants,
                                    is_visible_on_schedule: instance.is_visible_on_schedule,
                                },
                                account.classroom_id!,
                            );

                            return {
                                classroom_id: account.classroom_id!,
                                account_id: account.id!,
                                meeting_id: meetingId,
                                uuid: instance.uuid!,
                                start_time: instance.start_time,
                                class_type: instance.class_type,
                                participants: instance.participants || [],
                                poll_results: instance.poll_results || [],
                                // CRITICAL: Preserve existing justifications to prevent data loss
                                justifications: existingInstance.justifications || instance.justifications || [],
                                synchronized_at: new Date().toISOString(),
                                is_visible_on_schedule: isInstanceMustBeVisible,
                            };
                        })
                        .filter((item): item is NonNullable<typeof item> => item !== null);

                    // Update existing instances with fresh data
                    if (existingInstancesUpdates.length > 0) {
                        const success = await pastInstanciesStore.upsertMultiplePastInstances(
                            account.classroom_id,
                            existingInstancesUpdates,
                        );
                        if (!success) throw new Error("Error updating existing instances");
                    }
                    return;
                } catch (error) {
                    log.error(
                        { err: error, operation: "updateExistingPastInstances" },
                        "Error updating existing past instances",
                    );
                    throw error;
                }
            },

            fetchPastInstancesData: async (account, instances) => {
                try {
                    if (!validateZoomAccount(account)) throw new Error("Account data is missing");

                    if (instances.length === 0) {
                        return [];
                    }

                    const zoomAPIStore = useZoomAPIStore.getState();

                    const enrichedInstances = [];

                    for (const instance of instances) {
                        // If no UUID, skip fetching participants and poll results
                        if (!instance.uuid) {
                            enrichedInstances.push({
                                ...instance,
                                participants: [],
                                poll_results: [],
                            });
                            continue;
                        }

                        try {
                            // Fetch participants and poll results in parallel
                            const [participants, pollResults] = await Promise.all([
                                zoomAPIStore.getAllParticipantsByMeetingIdFromAPI(account, instance.uuid),
                                zoomAPIStore.getAllPollResultsByMeetingIdFromAPI(account, instance.uuid),
                            ]);

                            enrichedInstances.push({
                                ...instance,
                                participants: participants || [],
                                poll_results: pollResults || [],
                            });
                        } catch (error) {
                            console.error(`Error processing instance ${instance.uuid}:`, error);
                            enrichedInstances.push({
                                ...instance,
                                participants: [],
                                poll_results: [],
                            });
                        }
                    }

                    return enrichedInstances;
                } catch (error) {
                    log.error({ err: error, operation: "fetchPastInstancesData" }, "Error fetching past instances data");

                    return instances.map((instance) => ({
                        ...instance,
                        participants: [],
                        poll_results: [],
                    }));
                }
            },

            refreshAllPastInstancesForMeeting: async (meeting, account) => {
                try {
                    if (!validateZoomAccount(account)) throw new Error("Account data is missing");
                    if (!validateMeeting(meeting)) throw new Error("Meeting data is missing");

                    const currentState = get();

                    const currentMeeting = currentState.meetings.find((m) => m.id === meeting.id);
                    if (!currentMeeting) {
                        throw new Error("Meeting not found in current meetings");
                    }

                    const updatedMeetingData = await useZoomAPIStore.getState().getMeetingByAPI(account, meeting);

                    if (!updatedMeetingData) throw new Error("no meeting response");

                    if (
                        updatedMeetingData &&
                        (RECURRING_MEETING_TYPES as readonly number[]).includes(updatedMeetingData.type)
                    ) {
                        // Update all instances (new and existing)
                        const meetingWithPastInstances = updatedMeetingData as Omit<
                            ZoomMeetingWithPastInstancies,
                            "id" | "created_at"
                        >;
                        const result = await currentState.handleRecurrentMeetingUpdate(
                            meeting,
                            account,
                            meetingWithPastInstances,
                            "all",
                        );

                        if (!result) {
                            throw new Error("Error updating past instances");
                        }
                    } else {
                        throw new Error("Meeting is not recurrent");
                    }

                    return true;
                } catch (error) {
                    log.error(
                        { err: error, operation: "refreshAllPastInstancesForMeeting" },
                        "Error refreshing all past instances for meeting",
                    );
                    return false;
                }
            },

            refreshAndAddOnlyNewPastInstances: async (meeting, account) => {
                try {
                    if (!validateZoomAccount(account)) throw new Error("Account data is missing");
                    if (!validateMeeting(meeting)) throw new Error("Meeting data is missing");

                    const currentState = get();

                    const currentMeeting = currentState.meetings.find((m) => m.id === meeting.id);
                    if (!currentMeeting) {
                        throw new Error("Meeting not found in current meetings");
                    }

                    const zoomAPIStore = useZoomAPIStore.getState();

                    const updatedMeetingData = await zoomAPIStore.getMeetingByAPI(account, meeting);
                    if (!updatedMeetingData) throw new Error("no meeting response");

                    // Check if it's a recurrent meeting with past instances
                    if (
                        updatedMeetingData &&
                        (RECURRING_MEETING_TYPES as readonly number[]).includes(updatedMeetingData.type) &&
                        "past_instances" in updatedMeetingData
                    ) {
                        const meetingWithPastInstances = updatedMeetingData as Omit<
                            ZoomMeetingWithPastInstancies,
                            "id" | "created_at"
                        >;
                        const { past_instances, occurrences } = meetingWithPastInstances;

                        if (past_instances && past_instances.length > 0) {
                            await get().processNewPastInstances(meeting, account, past_instances);
                        }

                        const currentOccurrences =
                            currentState.meetings.find((m) => m.id === meeting.id)?.occurrences?.map((o) => o.occurrence_id) ||
                            [];

                        // If no occurrences in the current meeting, we consider an empty array
                        const isOccurrencesChange =
                            occurrences &&
                            occurrences.length !== currentOccurrences.length &&
                            occurrences.some((o) => !currentOccurrences.includes(o.occurrence_id));

                        if (isOccurrencesChange) {
                            // Only process NEW occurrences (don't touch existing ones)
                            await currentState.updateMeeting(meeting.id, {
                                occurrences,
                            });
                        }
                    }

                    return true;
                } catch (error) {
                    log.error(
                        { err: error, operation: "refreshAndAddOnlyNewPastInstances" },
                        "Error refreshing and adding only new past instances",
                    );
                    return false;
                }
            },

            deleteMeeting: async (meetingId) => {
                try {
                    // Validating the meeting ID before proceeding
                    if (!meetingId) throw new Error("meeting id is required to delete");

                    // Fetch the current meeting from the store to ensure it exists
                    const currentState = get();

                    // Confirm the meeting exists in the store
                    const currentMeeting = currentState.meetings.find((m) => m.id === meetingId);
                    if (!currentMeeting) {
                        throw new Error("Meeting not found in current meetings");
                    }

                    const response = await deleteZoomMeetingById(meetingId);
                    if (!response) throw new Error("no delete meeting response");

                    set({
                        meetings: currentState.meetings.filter((meeting) => meeting.id !== meetingId),
                    });

                    return true;
                } catch (error) {
                    log.error({ err: error, operation: "deleteMeeting" }, "Error deleting meeting");
                    return false;
                }
            },

            reset: () => {
                set(initialState);
            },
        }),
        { name: "ZoomMeetingStore" },
    ),
);
