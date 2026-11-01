import { z } from "zod";

export type FieldErrors = Record<string, string[] | undefined>;

/** The shape every server action returns, so forms can handle them uniformly. */
export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

export function invalid(error: z.ZodError): ActionResult {
  return {
    ok: false,
    error: "Please check the highlighted fields.",
    fieldErrors: z.flattenError(error).fieldErrors as FieldErrors,
  };
}

export const tooManyRequests: ActionResult = {
  ok: false,
  error: "Too many attempts. Please wait a few minutes and try again.",
};

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
