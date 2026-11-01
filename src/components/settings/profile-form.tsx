"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateProfileAction } from "@/lib/actions/account";
import { profileSchema, type ProfileInput } from "@/lib/validation/account";
import { useActionForm } from "@/hooks/use-action-form";
import { FormStatus } from "@/components/auth/form-status";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function ProfileForm({ name }: { name: string }) {
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name },
  });
  const { onSubmit, pending, error, message } = useActionForm(
    form,
    updateProfileAction,
  );

  useEffect(() => {
    if (message) toast.success(message);
  }, [message]);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
        <FormStatus error={error} />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={pending} className="justify-self-start">
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </Form>
  );
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
