import { createPrisma } from "@repo/db";
import type { CloudflareBindings } from "../types/cloudflare";

// Matches the dashboard's 30-day history window. Older rows are never displayed,
// so pruning them keeps the table (and every subsequent scan) bounded.
export const RETENTION_DAYS = 30;

export async function pruneOldMonitorChecks(env: CloudflareBindings) {
  const prisma = createPrisma(env.DB);

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const { count } = await prisma.monitorCheck.deleteMany({
    where: {
      checkedAt: {
        lt: cutoff,
      },
    },
  });

  return count;
}
