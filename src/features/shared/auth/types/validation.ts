// Global imports
import z from "zod";

// Local imports
import {
  signInSchema,
  newPasswordSchema,
  resendConfirmationSchema,
  resetPasswordSchema,
} from "../utils/validation";

// Export inferred types
export type LoginSchemaT = z.infer<typeof signInSchema>;
export type ResetPasswordSchemaT = z.infer<typeof resetPasswordSchema>;
export type ResendConfirmationSchemaT = z.infer<
  typeof resendConfirmationSchema
>;
export type NewPasswordSchemaT = z.infer<typeof newPasswordSchema>;
