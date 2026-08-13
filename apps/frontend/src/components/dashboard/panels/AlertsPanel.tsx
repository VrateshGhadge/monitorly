import type { AlertEvent } from "../../../types/dashboard";

interface AlertsPanelProps {
  alerts: AlertEvent[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const activeCount = alerts.filter((a) => a.status === "sent").length;

  return (
    <div className="panel full-panel" style={{ marginTop: "13px" }}>
      <div className="panel-head">
        <h4>Email alerts</h4>
        <small>{activeCount} ACTIVE</small>
      </div>
      <div className="row-line">
        <span style={{ color: "var(--muted)" }}>
          Alerts are sent by email to team@acme.dev
        </span>
      </div>
      {alerts.map((a) => (
        <div className="row-line" key={a.id}>
          <div>
            <b>{a.monitor}</b>
            <div className="row-sub">
              {a.detail} · {a.time}
            </div>
          </div>
          <span className={`hb-status${a.status === "sent" ? " late" : ""}`}>
            {a.status === "sent" ? "SENT" : "RESOLVED"}
          </span>
        </div>
      ))}
    </div>
  );
}
