import { ZoomAccountT } from "./accounts";
import { ZoomClassT, ZoomMeetingParticipant, ZoomMeetingPollResultsT, ZoomMeetingJustificationT } from "./meetings";

export interface ZoomMeetingPastInstance {
    id: string;
    classroom_id: string;
    account_id: string;
    meeting_id: string;
    uuid: string;
    start_time?: string;
    class_type: ZoomClassT;
    participants?: ZoomMeetingParticipant[];
    poll_results?: ZoomMeetingPollResultsT[];
    synchronized_at?: string;
    created_at: string;
    is_visible_on_schedule?: boolean;
    justifications?: ZoomMeetingJustificationT[];
}

export interface ZoomMeetingPastInstanceState {
    pastInstances: ZoomMeetingPastInstance[];
    loading: boolean;
}

export interface ZoomMeetingPastInstanceActions {
    setPastInstances: (pastInstances: ZoomMeetingPastInstance[]) => void;
    getAllPastInstancesByClassroom: (classroomId: string) => Promise<boolean>;
    getAllPastInstancesByMeeting: (meetingId: string) => Promise<boolean>;
    getPastInstanceById: (pastInstanceId: string) => Promise<ZoomMeetingPastInstance | boolean>;
    getPastInstanceByUuid: (uuid: string) => Promise<ZoomMeetingPastInstance | boolean>;
    createPastInstance: (pastInstanceData: Partial<Omit<ZoomMeetingPastInstance, "id" | "created_at">>) => Promise<boolean>;
    createMultiplePastInstances: (
        pastInstancesData: Partial<Omit<ZoomMeetingPastInstance, "id" | "created_at">>[],
    ) => Promise<boolean>;
    upsertMultiplePastInstances: (
        classroomId: string,
        pastInstancesData: Partial<Omit<ZoomMeetingPastInstance, "id" | "created_at">>[],
    ) => Promise<boolean>;
    updatePastInstanceById: (
        pastInstanceId: string,
        updates: Partial<Omit<ZoomMeetingPastInstance, "id" | "created_at">>,
    ) => Promise<boolean>;
    updatePastInstanceByUuid: (
        uuid: string,
        updates: Partial<Omit<ZoomMeetingPastInstance, "id" | "created_at">>,
    ) => Promise<boolean>;
    deletePastInstance: (pastInstanceId: string) => Promise<boolean>;
    refreshInstanceData: (instanceId: string, uuid: string, account: ZoomAccountT) => Promise<boolean>;
    refreshMultipleInstancesData: (
        instances: Array<{
            instanceId: string;
            uuid: string;
            account: ZoomAccountT;
        }>,
    ) => Promise<boolean>;
    _getPastInstancesByMeetingId: (meetingId: string) => Promise<ZoomMeetingPastInstance[] | false>;
    reset: () => void;
}
