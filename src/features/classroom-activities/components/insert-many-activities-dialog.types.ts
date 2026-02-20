import { ChangeEvent } from "react";

import { ActivityClassTypes } from "../types";

export interface StudentData {
    readonly email: string;
    readonly status?: "success" | "error" | "warning";
}

export interface ActivityRow {
    readonly [key: string]: string | undefined;
}

export type DialogStage = 0 | 1 | 2;

export interface CsvUploadSectionProps {
    readonly onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export interface ActivityConfigSectionProps {
    readonly activityType: ActivityClassTypes;
    readonly onActivityTypeChange: (value: ActivityClassTypes) => void;
    readonly activityDate: string;
    readonly onActivityDateChange: (value: string) => void;
    readonly activityVisible: boolean;
    readonly onActivityVisibleChange: (value: boolean) => void;
}

export interface ParticipantsTableProps {
    readonly students: StudentData[];
    readonly stage: DialogStage;
    readonly onStudentEmailChange: (index: number, value: string) => void;
}

export interface DialogActionsFooterProps {
    readonly stage: DialogStage;
    readonly students: StudentData[];
    readonly loading: boolean;
    readonly onBackToUpload: () => void;
    readonly onSubmitAsync: () => Promise<void>;
    readonly onRetryFailed: () => void;
}
