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

export interface UserModeFeatureRuleT {
  id: string;
  isVisible?: boolean;
  aggregateInMetric?: boolean;
}

export interface ClassroomConfigUserModeT {
  id: string;
  title: string;
  key: string;
  color: string;
  featuresRules: Array<UserModeFeatureRuleT>;
  created_at?: string;
  updated_at?: string;
}
