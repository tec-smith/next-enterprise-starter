import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { verifyEmail } from "@/lib/actions/auth";
import { FormStatus } from "@/components/auth/form-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  title: "Verify email",
  description: "Confirm your email address.",
  path: "/verify-email",
  noIndex: true,
});

export default async function VerifyEmailPage({
  searchParams,
}: PageProps<"/verify-email">) {
  const { token } = await searchParams;
  const result =
    typeof token === "string" && token
      ? await verifyEmail(token)
      : ({ ok: false, error: "This verification link is invalid." } as const);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Email verification</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {result.ok ? (
          <FormStatus message={result.message} />
        ) : (
          <FormStatus error={result.error} />
        )}
        <Button asChild>
          <Link href="/sign-in">Go to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
