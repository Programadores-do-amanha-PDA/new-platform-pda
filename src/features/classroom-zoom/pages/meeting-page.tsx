"use client";
import { useParams } from "next/navigation";
import { NotFoundState } from "@/components/shared/empty-states/not-found-state";

import ZoomPastMeetingPage from "./past-meeting-page";
import ZoomRecurrenceMeetingPage from "./recurrence-meeting-page";
import { useZoomMeetingStore } from "../stores/meetings";
import { RECURRING_MEETING_TYPES, NON_RECURRING_MEETING_TYPES } from "../utils/meeting-utils";

export default function ZoomMeetingPage() {
    const { meeting_id, classroom_id } = useParams<{
        meeting_id: string;
        classroom_id: string;
    }>();
    const { meetings } = useZoomMeetingStore();

    const currentMeeting = meetings?.find((m) => m.id === meeting_id);

    if (!currentMeeting) {
        return (
            <NotFoundState
                title="Reunião não encontrada."
                description="Verifique se o ID da reunião está correto ou se a reunião esta cadastrada na turma."
                href={`/dashboard/classrooms/${classroom_id}/zoom/meetings`}
                buttonText="Ver todas as reuniões"
            />
        );
    }

    if (currentMeeting?.type && (RECURRING_MEETING_TYPES as readonly number[]).includes(currentMeeting.type as number)) {
        return <ZoomRecurrenceMeetingPage currentMeeting={currentMeeting} />;
    } else if (
        currentMeeting?.type &&
        (NON_RECURRING_MEETING_TYPES as readonly number[]).includes(currentMeeting?.type as number)
    ) {
        return <ZoomPastMeetingPage currentMeeting={currentMeeting} />;
    }

    return null;
}
