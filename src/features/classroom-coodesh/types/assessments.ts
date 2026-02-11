import { DateRange } from "react-day-picker";
import { CoodeshAttemptParticipantData } from "./attempts";

export interface CoodeshAssessmentQuestion {
    name: string;
    description: string;
    type: string;
    type_formatted: string;
    level?: string;
    level_formatted?: string;
    duration: number;
    duration_unit: string;
}

export interface CoodeshAssessmentPayload {
    assessment_id: string;
    name: string;
    description: string;
    default_locale?: "pt" | "en" | "es" | string;
    duration: number;
    duration_unit: string;
    questions: CoodeshAssessmentQuestion[];
}

export interface CoodeshAssessmentsList {
    offset?: number;
    total?: number;
    limit?: number;
    payload: CoodeshAssessmentPayload[];
}

export interface CoodeshAssessment extends CoodeshAssessmentPayload {
    id?: string;
    assessment_id: string;
    classroom_id: string;
    participants_data?: CoodeshAttemptParticipantData[];
    schedule_date?: DateRange | undefined;
    is_visible_on_schedule?: boolean;
    accept_late_deliveries?: boolean;
    created_at: string;
    updated_at?: string;
}
