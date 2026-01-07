export interface UserModeFormData {
    title: string;
    key: string;
    color: string;
    featuresRules: UserModeFeatureRule[];
}

export interface UserModeFormDialogProps {
    configId: string;
    currentUserMode?: UserMode | null;
    trigger?: React.ReactNode;
    onClose?: () => void;
}

export interface UserModeFeatureRule {
    id: string;
    isVisible?: boolean;
    aggregateInMetric?: boolean;
}

export interface UserMode {
    id: string;
    title: string;
    key: string;
    color: string;
    featuresRules: UserModeFeatureRule[];
    created_at?: string;
    updated_at?: string;
}
