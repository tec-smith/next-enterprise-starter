import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { FormStatus } from "@/components/auth/form-status";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  title: "Reset password",
  description: "Choose a new password.",
  path: "/reset-password",
  noIndex: true,
});

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  const { token } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Choose a new password</CardTitle>
        <CardDescription>
          Your new password replaces the old one straight away.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {typeof token === "string" && token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <FormStatus error="This reset link is invalid. Request a new one." />
        )}
      </CardContent>
      <CardFooter className="justify-center text-sm">
        <Link
          href="/forgot-password"
          className="text-muted-foreground underline-offset-4 hover:underline"
        >
          Request a new link
        </Link>
      </CardFooter>
    </Card>
  );
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
