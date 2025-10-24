import { ClassroomConfigUserMode } from "@/types/classroom-configs";

// User Mode Types
export interface UserModeFormDataT {
  title: string;
  key: string;
  color: string;
  featuresRules: UserModeFeatureRuleT[];
}

export interface UserModeFeatureRuleT {
  id: string;
  isVisible: boolean;
  aggregateInMetric: boolean;
}

export interface UserModeFormDialogPropsT {
  configId: string;
  currentUserMode?: ClassroomConfigUserMode | null;
  trigger?: React.ReactNode;
  onClose?: () => void;
}
