export interface ResetPasswordFormDataT {
  email: string;
}

export interface ResetPasswordResponseT {
  error: boolean;
  message?: string;
}

export interface ResetPasswordFormPropsT {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// New password
export interface NewPasswordFormDataT {
  password: string;
  confirmPassword: string;
}

// Component props
export interface NewPasswordFormPropsT {
  token?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}
