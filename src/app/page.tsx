import type { Metadata } from "next";
import Link from "next/link";
import { features } from "@/config/features";
import { siteConfig } from "@/config/site";
import { auth } from "@/lib/auth";
import { pageMetadata } from "@/lib/metadata";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  description: siteConfig.description,
  path: "/",
});

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Start your next product from a production-ready base
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
            {siteConfig.description}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              {session?.user ? (
                <Link href="/dashboard">Go to dashboard</Link>
              ) : (
                <Link href="/sign-up">Create an account</Link>
              )}
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href={siteConfig.repositoryUrl}
                target="_blank"
                rel="noreferrer"
              >
                View on GitHub
              </a>
            </Button>
          </div>
        </section>
        <section
          aria-labelledby="features"
          className="mx-auto max-w-6xl px-4 pb-24"
        >
          <h2 id="features" className="sr-only">
            Features
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardHeader>
                  <Icon
                    className="mb-2 size-5 text-muted-foreground"
                    aria-hidden
                  />
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
