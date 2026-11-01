import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin" };

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export default async function AdminPage() {
  await requireRole("ADMIN");

  const [users, total] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    }),
    db.user.count(),
  ]);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {total} total
            {total > users.length ? `, showing the newest ${users.length}` : ""}
            . Only admins can see this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 pr-4 font-medium">Verified</th>
                <th className="py-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{user.name ?? "—"}</td>
                  <td className="py-2 pr-4">{user.email}</td>
                  <td className="py-2 pr-4">{user.role}</td>
                  <td className="py-2 pr-4">
                    {user.emailVerified ? "Yes" : "No"}
                  </td>
                  <td className="py-2">{dateFormat.format(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
