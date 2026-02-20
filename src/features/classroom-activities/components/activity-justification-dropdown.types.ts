import { ActivityJustification, ClassActivity } from "../types";

/** Props for the ActivityJustificationDropdown component. */
export interface ActivityJustificationDropdownProps {
    readonly currentActivity: ClassActivity;
    readonly currentUserEmail: string;
}

/** Props for the ActivityParticipationToggle sub-component. */
export interface ActivityParticipationToggleProps {
    readonly hasParticipated: boolean;
    readonly loading: boolean;
    readonly onToggle: () => void;
}

/** Props for the ActivityJustificationForm sub-component. */
export interface ActivityJustificationFormProps {
    readonly justification: string;
    readonly currentJustification: ActivityJustification | undefined;
    readonly loading: boolean;
    readonly deleteLoading: boolean;
    readonly onJustificationChange: (value: string) => void;
    readonly onSave: () => void;
    readonly onDelete: () => void;
}
