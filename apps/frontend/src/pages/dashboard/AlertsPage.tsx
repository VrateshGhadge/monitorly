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

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-field">
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
          <div className="table table-6col">
            <div className="table-head">
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
          <div className="table table-6col">
            <div className="table-head">
              <span>Severity</span>
              <span>Monitor</span>
              <span>Message</span>
              <span>Sent to</span>
              <span>Time</span>
              <span>Status</span>
            </div>
            {filtered.map((a) => (
              <div className="table-row" key={a.id}>
                <div className="table-cell">
                  <SeverityBadge severity={a.severity} />
                </div>
                <div className="table-cell">
                  <b>{a.monitor}</b>
                </div>
                <div className="table-cell table-cell-muted">{a.message}</div>
                <div className="table-cell table-cell-muted">{a.email}</div>
                {/* <div className="table-cell table-cell-muted">{a.time}</div> */}
                <div className="table-cell table-cell-muted">
                  {" "}
                  {formatLastChecked(a.time)}{" "}
                </div>
                <div className="table-cell">
                  <span
                    className={`hb-status${a.status === "sent" ? " late" : ""}`}
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
