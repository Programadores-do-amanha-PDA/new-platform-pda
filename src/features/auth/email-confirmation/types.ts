import { z } from "zod/mini";
import { emailConfirmationSchema } from "./utils";

export type EmailConfirmationFormSchema = z.infer<typeof emailConfirmationSchema>;
