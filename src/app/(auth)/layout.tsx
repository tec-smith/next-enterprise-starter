import Link from "next/link";
import { Boxes } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-4">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Boxes className="size-5" aria-hidden />
        {siteConfig.name}
      </Link>
      <main className="w-full max-w-sm">{children}</main>
    </div>
  );
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
