// Global imports
import z from "zod";

// Local imports
import {
  loginSchema,
  newPasswordSchema,
  resendConfirmationSchema,
  resetPasswordSchema,
} from "../utils/validation";

// Export inferred types
export type LoginSchemaT = z.infer<typeof loginSchema>;
export type ResetPasswordSchemaT = z.infer<typeof resetPasswordSchema>;
export type ResendConfirmationSchemaT = z.infer<
  typeof resendConfirmationSchema
>;
export type NewPasswordSchemaT = z.infer<typeof newPasswordSchema>;
