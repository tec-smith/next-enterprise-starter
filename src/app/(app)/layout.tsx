import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { SiteHeader } from "@/components/layout/site-header";

// Signed-in pages stay out of search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// The proxy already redirects signed-out visitors; this check also covers
// anything the proxy matcher skips, so pages are never rendered without a user.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        {children}
      </main>
    </div>
  );
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
