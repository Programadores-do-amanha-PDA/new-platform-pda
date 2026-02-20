import { z } from "zod/mini";
import { requestResetPasswordByEmailSchema, setNewPasswordSchema } from "./utils";

export type RequestResetPasswordByEmailSchema = z.infer<typeof requestResetPasswordByEmailSchema>;

export type SetNewPasswordSchema = z.infer<typeof setNewPasswordSchema>;