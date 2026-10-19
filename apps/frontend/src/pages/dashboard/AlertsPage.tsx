import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { AppData } from "../../hooks/useAppData";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import Dropdown from "../../components/ui/Dropdown";
import EmptyState from "../../components/ui/EmptyState";
import { TableRowSkeleton } from "../../components/ui/Skeleton";
import { AlertsIcon, SearchIcon } from "../../components/app/icons";
import type { AlertSeverity } from "../../types/app";
import { formatLastChecked } from "../../lib/date";

const SEVERITY_OPTIONS = [
  { value: "all", label: "All alerts" },
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warning" },
  { value: "resolved", label: "Resolved" },
];

function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  if (severity === "critical") return <Badge tone="red">Critical</Badge>;
  if (severity === "warning") return <Badge tone="yellow">Warning</Badge>;
  return <Badge tone="green">Resolved</Badge>;
}

export default function AlertsPage() {
  const { alerts, isLoading, alertsSentCount } = useOutletContext<AppData>();
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const matchesSearch =
        !search.trim() ||
        a.monitor.toLowerCase().includes(search.toLowerCase()) ||
        a.message.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity = severity === "all" || a.severity === severity;
      return matchesSearch && matchesSeverity;
    });
  }, [alerts, search, severity]);

  return (
    <>
      <PageHeader
        eyebrow="Alerts"
        title="Alert history"
        description={`${alertsSentCount} active email alert${alertsSentCount === 1 ? "" : "s"} · sent to your notification email.`}
      />

      <div className="overflow-hidden rounded-[10px] border border-line bg-panel">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3.5">
          <div className="flex min-w-[200px] flex-1 items-center gap-[9px] rounded-[7px] border border-line bg-[#0d1014] px-[11px] py-2 text-[#7c828c] light:bg-white light:text-[#14161a] [&>input]:flex-1 [&>input]:border-0 [&>input]:bg-transparent [&>input]:text-[13px] [&>input]:text-ink [&>input]:outline-none [&>input::placeholder]:text-[#5b6169]">
            <SearchIcon size={15} />
            <input
              placeholder="Search by monitor or message…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dropdown
            size="sm"
            options={SEVERITY_OPTIONS}
            value={severity}
            onChange={setSeverity}
          />
        </div>

        {isLoading ? (
          <div className="w-full table-6col">
            <div className="grid grid-cols-[0.8fr_1fr_1.8fr_1.2fr_0.9fr_0.8fr] gap-2.5 border-b border-line px-4 py-2.5 font-code text-[10px] leading-[normal] tracking-[0.06em] text-[#6f7782] uppercase [@media(max-width:720px)]:hidden">
              <span>Severity</span>
              <span>Monitor</span>
              <span>Message</span>
              <span>Sent to</span>
              <span>Time</span>
              <span>Status</span>
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRowSkeleton key={i} columns={6} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<AlertsIcon size={26} />}
            title={
              alerts.length === 0
                ? "No alerts yet"
                : "No alerts match your filters"
            }
            description={
              alerts.length === 0
                ? "Alerts will appear here once you've created a monitor and it triggers an email notification."
                : "Try a different search term or severity filter."
            }
          />
        ) : (
          <div className="w-full table-6col">
            <div className="grid grid-cols-[0.8fr_1fr_1.8fr_1.2fr_0.9fr_0.8fr] gap-2.5 border-b border-line px-4 py-2.5 font-code text-[10px] leading-[normal] tracking-[0.06em] text-[#6f7782] uppercase [@media(max-width:720px)]:hidden">
              <span>Severity</span>
              <span>Monitor</span>
              <span>Message</span>
              <span>Sent to</span>
              <span>Time</span>
              <span>Status</span>
            </div>
            {filtered.map((a) => (
              <div className="grid grid-cols-[0.8fr_1fr_1.8fr_1.2fr_0.9fr_0.8fr] items-center gap-2.5 border-b border-[#1b2027] px-4 py-[13px] text-[13px] [transition:0.12s] last:border-b-0 hover:bg-[#141920] light:border-[#edeef1] light:hover:bg-[#f7f8f9] [@media(max-width:720px)]:relative [@media(min-width:561px)_and_(max-width:720px)]:grid-cols-2 [@media(max-width:720px)]:items-start [@media(max-width:720px)]:gap-x-3.5 [@media(max-width:720px)]:gap-y-2.5 [@media(max-width:720px)]:px-4 [@media(max-width:720px)]:py-3.5 [@media(max-width:560px)]:grid-cols-1" key={a.id}>
                <div className="min-w-0 text-[#c9cdd3] [&>b]:block [&>b]:text-[13px] [&>b]:font-semibold" data-label="Severity">
                  <SeverityBadge severity={a.severity} />
                </div>
                <div className="min-w-0 text-[#c9cdd3] [&>b]:block [&>b]:text-[13px] [&>b]:font-semibold" data-label="Monitor">
                  <b>{a.monitor}</b>
                </div>
                <div className="min-w-0 text-[12.5px] text-muted" data-label="Message">
                  {a.message}
                </div>
                <div
                  className="min-w-0 text-[12.5px] text-muted"
                  data-label="Sent to"
                >
                  {a.email}
                </div>
                {/* <div className="min-w-0 text-[12.5px] text-muted">{a.time}</div> */}
                <div className="min-w-0 text-[12.5px] text-muted" data-label="Time">
                  {formatLastChecked(a.time)}
                </div>
                <div className="min-w-0 text-[#c9cdd3] [&>b]:block [&>b]:text-[13px] [&>b]:font-semibold" data-label="Status">
                  <span
                    className={`rounded border px-[7px] py-[3px] font-code text-[9px] leading-[normal] ${a.status === "sent" ? "border-[#5c3d1a] text-warning" : "border-[#254d3a] text-brand"}`}
                  >
                    {a.status === "sent" ? "SENT" : "RESOLVED"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
