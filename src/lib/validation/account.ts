import { z } from "zod";
import { passwordSchema } from "@/lib/validation/auth";

export const profileSchema = z.object({
  name: z.string().trim().min(1, { error: "Enter your name." }).max(100),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { error: "Enter your current password." }),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Passwords don't match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    error: "Choose a password you haven't used here.",
    path: ["newPassword"],
  });

export type ProfileInput = z.input<typeof profileSchema>;
export type ChangePasswordInput = z.input<typeof changePasswordSchema>;

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
