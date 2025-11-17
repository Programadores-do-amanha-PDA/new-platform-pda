export type SendEmailVerificationToMultipleUsersResultT =
  | {
      success: boolean;
      results: {
        successful: string[];
        failed: string[];
        total: number;
      };
      error?: undefined;
    }
  | {
      success: boolean;
      error: string;
      results?: undefined;
    };

export type SendPasswordResetToMultipleUsersResultT =
  | {
      success: boolean;
      results: {
        successful: string[];
        failed: string[];
        total: number;
      };
      error?: undefined;
    }
  | {
      success: boolean;
      error: string;
      results?: undefined;
    };
