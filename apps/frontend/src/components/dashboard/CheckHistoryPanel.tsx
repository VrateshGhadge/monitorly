import { useEffect, useMemo, useState } from "react";

import { getMonitorHistory, type MonitorHistory } from "../../api/monitor";
import { formatLastChecked } from "../../lib/date";

import EmptyState from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";

interface CheckHistoryPanelProps {
  monitorId: string;
}

/**
 * How much history to surface here:
 *
 * A monitor checked every minute racks up 1,440 rows a day — dumping all of
 * that on the page would be noise, not signal, and would make the panel
 * grow unbounded. Instead this shows the most recent checks first (people
 * care about "is it fine right now / what just happened"), capped to a
 * small page by default with a manual "show more" step rather than infinite
 * scroll or a full paginated table — this is a lightweight pulse-check, not
 * a log viewer. `MAX_ROWS` puts a hard ceiling on how far back "show more"
 * goes; anything older belongs in the 30-day Uptime history / incidents
 * views above, which already summarize longer ranges without listing every
 * individual check.
 */

/**
 * Show the latest checks with a compact initial view.
 * The backend limits the history response to 30 checks.
 */
const INITIAL_ROWS = 5;
const MAX_ROWS = 30;

export default function CheckHistoryPanel({
  monitorId,
}: CheckHistoryPanelProps) {
  const [checks, setChecks] = useState<MonitorHistory[] | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setChecks(null);
    setExpanded(false);

    getMonitorHistory(monitorId)
      .then((data) => {
        if (!cancelled) setChecks(data);
      })
      .catch(() => {
        if (!cancelled) setChecks([]);
      });

    return () => {
      cancelled = true;
    };
  }, [monitorId]);

  const sorted = useMemo(
    () =>
      (checks ?? [])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime(),
        )
        .slice(0, MAX_ROWS),
    [checks],
  );

  const visible = expanded ? sorted : sorted.slice(0, INITIAL_ROWS);
  const hiddenCount = sorted.length - visible.length;

  return (
    <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px]">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="m-0 text-[11px] font-semibold">History</h4>
        <small>LATEST CHECKS</small>
      </div>

      {checks === null ? (
        <div className="flex flex-col">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="flex items-center justify-between border-t border-[#222830] px-1 py-[11px] text-[12px] first:border-t-0" key={i}>
              <Skeleton width={170} height={12} />
              <Skeleton width={44} height={12} />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No checks recorded yet."
          description="Once monitoring begins, every check will show up here."
        />
      ) : (
        <>
          <div className="flex flex-col">
            {visible.map((check, i) => {
              const ok = check.status === "UP";

              return (
                <div className="flex items-center justify-between border-t border-[#222830] px-1 py-[11px] text-[12px] first:border-t-0" key={`${check.checkedAt}-${i}`}>
                  <div className="flex items-center gap-2.5">
                    <i
                      className="mr-1 inline-block size-1.5 rounded-full bg-brand"
                      style={{ background: ok ? "var(--green)" : "var(--red)" }}
                    />
                    <div>
                      <b className="font-semibold">{ok ? "Check passed" : "Check failed"}</b>
                      <div className="mt-0.5 text-[10px] text-[#818994]">
                        {check.statusCode ? `HTTP ${check.statusCode} · ` : ""}
                        {formatLastChecked(check.checkedAt)}
                      </div>
                    </div>
                  </div>

                  <span
                    className="overflow-hidden font-code text-[12px] leading-[normal] text-ellipsis whitespace-nowrap text-[#9aa2ac]"
                    style={{ fontSize: 11, flexShrink: 0 }}
                  >
                    {check.responseTime != null
                      ? `${check.responseTime}ms`
                      : "—"}
                  </span>
                </div>
              );
            })}
          </div>

          {hiddenCount > 0 && (
            <div
              className="mt-3.5 block cursor-pointer rounded-md border border-dashed border-[#262c34] p-2 text-center font-code text-[10px] leading-[normal] text-[#8b929d] [transition:color_0.15s_ease,border-color_0.15s_ease] hover:border-[#3a4048] hover:text-[#e7eaee]"
              onClick={() => setExpanded(true)}
            >
              Show {hiddenCount} more checks →
            </div>
          )}
        </>
      )}
    </div>
  );
}
