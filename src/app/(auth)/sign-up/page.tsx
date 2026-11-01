import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";
import { connection } from "next/server";
import { enabledOAuthProviders } from "@/lib/auth";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { SignUpForm } from "@/components/auth/sign-up-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  title: "Create an account",
  description: `Create your ${siteConfig.name} account with email and password or a social provider.`,
  path: "/sign-up",
  // This page has its own social card: src/app/cards/sign-up/route.tsx.
  image: { url: "/cards/sign-up", alt: "Create an account" },
});

export default async function SignUpPage() {
  // Render per request so OAuth buttons follow runtime env, not build-time env.
  await connection();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>
          We&apos;ll email you a link to verify your address.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <OAuthButtons providers={enabledOAuthProviders} />
        <SignUpForm />
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Already registered?&nbsp;
        <Link
          href="/sign-in"
          className="text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
