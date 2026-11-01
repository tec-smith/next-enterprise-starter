"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to your error tracker (Sentry, etc.) here.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">
        An unexpected error occurred.
        {error.digest ? ` Reference: ${error.digest}` : ""}
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
