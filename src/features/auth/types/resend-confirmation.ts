export interface ResendConfirmationFormDataT {
  email: string;
}

export interface ResendConfirmationResponseT {
  error: boolean;
  message?: string;
}

// Component props
export interface ResendConfirmationFormPropsT {
  initialEmail?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}