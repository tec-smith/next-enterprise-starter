"use client";

import { useState, useTransition } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import type { ActionResult } from "@/lib/actions/result";

/**
 * Runs a server action from a react-hook-form submit handler and maps the
 * result back onto the form: field errors onto fields, everything else into
 * `error` / `message` for the form to display.
 */
export function useActionForm<T extends FieldValues>(
  form: UseFormReturn<T>,
  action: (values: T) => Promise<ActionResult | void>,
) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  const onSubmit = form.handleSubmit((values) => {
    setError(undefined);
    setMessage(undefined);
    startTransition(async () => {
      const result = await action(values);
      if (!result) return; // The action redirected.
      if (result.ok) {
        setMessage(result.message);
        return;
      }
      setError(result.error);
      for (const [field, messages] of Object.entries(
        result.fieldErrors ?? {},
      )) {
        if (messages?.[0])
          form.setError(field as Path<T>, { message: messages[0] });
      }
    });
  });

  return { onSubmit, pending, error, message };
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
