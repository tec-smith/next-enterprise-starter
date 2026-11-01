import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard" };

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export default async function DashboardPage() {
  const sessionUser = await requireUser();
  const user = await db.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: {
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { accounts: true } },
    },
  });

  const stats = [
    { label: "Role", value: user.role },
    { label: "Member since", value: dateFormat.format(user.createdAt) },
    { label: "Linked providers", value: String(user._count.accounts) },
  ];

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user.name ?? user.email}
        </h1>
        <p className="mt-1 text-muted-foreground">
          This page is protected. Replace it with your product&apos;s home
          screen.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Next steps</CardTitle>
          <CardDescription>Where to start building.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              Add your data models to <code>prisma/schema.prisma</code> and run{" "}
              <code>npm run db:migrate</code>.
            </li>
            <li>
              Put new protected pages in <code>src/app/(app)</code> and list
              their paths in <code>src/lib/routes.ts</code>.
            </li>
            <li>
              Write server actions in <code>src/lib/actions</code> and validate
              input with Zod.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
