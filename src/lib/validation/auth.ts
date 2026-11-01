import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email address." }));

export const passwordSchema = z
  .string()
  .min(8, { error: "Use at least 8 characters." })
  .max(72, { error: "Use 72 characters or fewer." }) // bcrypt ignores bytes past 72
  .regex(/[a-z]/, { error: "Include a lowercase letter." })
  .regex(/[A-Z]/, { error: "Include an uppercase letter." })
  .regex(/\d/, { error: "Include a number." });

export const signInSchema = z.object({
  email: emailSchema,
  // Don't enforce the password policy on sign-in: older passwords may predate it.
  password: z.string().min(1, { error: "Enter your password." }),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, { error: "Enter your name." }).max(100),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { error: "This reset link is invalid." }),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export type SignInInput = z.input<typeof signInSchema>;
export type SignUpInput = z.input<typeof signUpSchema>;
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
