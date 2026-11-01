import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma CLI configuration. Next.js loads .env files itself; the CLI needs
// dotenv because a config file turns off Prisma's own .env loading.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
