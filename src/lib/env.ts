import "server-only";
import { z } from "zod";

/**
 * Server environment, validated once at startup so a misconfigured deploy
 * fails loudly instead of at the first request that needs a missing value.
 * Set SKIP_ENV_VALIDATION=1 for builds that run without secrets (e.g. Docker).
 */
const optional = z
  .string()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.url(),
  AUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(32)
      : z.string().min(1).optional(),
  APP_URL: z.url().default("http://localhost:3000"),

  AUTH_GITHUB_ID: optional,
  AUTH_GITHUB_SECRET: optional,
  AUTH_GOOGLE_ID: optional,
  AUTH_GOOGLE_SECRET: optional,

  SMTP_HOST: optional,
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: optional,
  SMTP_PASSWORD: optional,
  MAIL_FROM: z
    .string()
    .default("Next Enterprise Starter <no-reply@example.com>"),

  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Env = z.infer<typeof schema>;

function loadEnv(): Env {
  if (process.env.SKIP_ENV_VALIDATION) {
    return schema.partial().parse(process.env) as Env;
  }

  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "Invalid environment variables:",
      z.flattenError(parsed.error).fieldErrors,
    );
    throw new Error(
      "Invalid environment variables. See the log above and .env.example.",
    );
  }
  return parsed.data;
}

export const env = loadEnv();

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
