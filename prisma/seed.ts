import { PrismaClient, type Role } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Development seed: creates a verified admin and a verified regular user.
 * Safe to run repeatedly. Refuses to run in production unless forced.
 */
const db = new PrismaClient();

const password = process.env.SEED_PASSWORD ?? "Password123!";

const users: { email: string; name: string; role: Role }[] = [
  { email: "admin@example.com", name: "Ada Admin", role: "ADMIN" },
  { email: "user@example.com", name: "Uma User", role: "USER" },
];

async function main() {
  if (process.env.NODE_ENV === "production" && !process.env.SEED_FORCE) {
    throw new Error(
      "Refusing to seed a production database. Set SEED_FORCE=1 to override.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  for (const user of users) {
    await db.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role },
      create: { ...user, passwordHash, emailVerified: new Date() },
    });
    console.log(`Seeded ${user.role.toLowerCase()} ${user.email}`);
  }
  console.log(`Password for seeded users: ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
