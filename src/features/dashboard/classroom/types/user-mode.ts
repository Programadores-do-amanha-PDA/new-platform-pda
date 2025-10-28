import { ClassroomConfigUserModeT, UserModeFeatureRuleT } from "@/types";

// User Mode Types
export interface UserModeFormDataT {
  title: string;
  key: string;
  color: string;
  featuresRules: UserModeFeatureRuleT[];
}

export interface UserModeFormDialogPropsT {
  configId: string;
  currentUserMode?: ClassroomConfigUserModeT | null;
  trigger?: React.ReactNode;
  onClose?: () => void;
}
