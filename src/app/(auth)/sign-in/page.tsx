import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";
import { enabledOAuthProviders } from "@/lib/auth";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { SignInForm } from "@/components/auth/sign-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  description: `Sign in to ${siteConfig.name}.`,
  path: "/sign-in",
});

// Errors Auth.js may pass back in ?error= after an OAuth attempt.
const errorMessages: Record<string, string> = {
  OAuthAccountNotLinked:
    "That email is already registered with a different sign-in method. Sign in the way you did originally.",
  AccessDenied: "Access was denied.",
  Configuration:
    "Sign-in is misconfigured on the server. Please contact support.",
};

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const { callbackUrl, error } = await searchParams;
  const callback = typeof callbackUrl === "string" ? callbackUrl : undefined;
  const initialError =
    typeof error === "string"
      ? (errorMessages[error] ?? "Sign-in failed. Please try again.")
      : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Sign in</CardTitle>
        <CardDescription>
          Welcome back. Sign in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <OAuthButtons
          providers={enabledOAuthProviders}
          callbackUrl={callback}
        />
        <SignInForm callbackUrl={callback} initialError={initialError} />
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        No account?&nbsp;
        <Link
          href="/sign-up"
          className="text-foreground underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </CardFooter>
    </Card>
  );
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
