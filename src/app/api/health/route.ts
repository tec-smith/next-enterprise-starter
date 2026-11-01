import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** Liveness and readiness probe for load balancers and container orchestrators. */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", database: "ok" });
  } catch (error) {
    logger.error("Health check failed", { error: String(error) });
    return Response.json(
      { status: "error", database: "unreachable" },
      { status: 503 },
    );
  }
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
