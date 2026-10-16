-- Performance indexes.
--
-- D1 bills "rows read" = rows *scanned*, not rows returned. The D1 init
-- migration (0001) only created single-column indexes, so every per-monitor
-- read that filters on "monitorId" and orders/ranges on "checkedAt" has to
-- scan the monitor's entire history and sort it in a temp b-tree. The 5-minute
-- cron does exactly that once per monitor per tick.
--
-- CREATE INDEX does not rebuild a table, so this is safe under D1's always-on
-- foreign key enforcement (see the note in 0002_user_google_auth.sql).

-- Cron "latest check" lookup (ORDER BY checkedAt DESC LIMIT 1) and every
-- history/detail range query (WHERE monitorId = ? [AND checkedAt >= ?]).
CREATE INDEX IF NOT EXISTS "MonitorCheck_monitorId_checkedAt_idx"
  ON "MonitorCheck"("monitorId", "checkedAt");

-- Retention prune (WHERE checkedAt < cutoff) - reads only the rows it deletes.
CREATE INDEX IF NOT EXISTS "MonitorCheck_checkedAt_idx"
  ON "MonitorCheck"("checkedAt");

-- Alerts list (WHERE userId = ? ORDER BY createdAt DESC) - removes the sort.
CREATE INDEX IF NOT EXISTS "Alert_userId_createdAt_idx"
  ON "Alert"("userId", "createdAt");

-- Monitor detail nested alerts (WHERE monitorId = ? AND createdAt >= ?).
CREATE INDEX IF NOT EXISTS "Alert_monitorId_createdAt_idx"
  ON "Alert"("monitorId", "createdAt");

-- Cron monitor selection (WHERE active = true).
CREATE INDEX IF NOT EXISTS "Monitor_active_idx"
  ON "Monitor"("active");
