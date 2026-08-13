import type { Monitor } from "../../types/dashboard";

interface MonitorRowProps {
  monitor: Monitor;
  onToggle: (id: string) => void;
}

export default function MonitorRow({ monitor, onToggle }: MonitorRowProps) {
  return (
    <div className="monitor-row" onClick={() => onToggle(monitor.id)}>
      <i
        className="status-dot"
        style={{
          background: monitor.status === "up" ? "var(--green)" : "var(--red)",
        }}
      ></i>
      <b>{monitor.name}</b>
      <span>{monitor.type}</span>
      <span>{monitor.uptimePct}%</span>
      <span
        style={{ color: monitor.status === "down" ? "var(--red)" : undefined }}
      >
        {monitor.status === "down" ? "—" : `${monitor.latency}ms`}
      </span>
    </div>
  );
}
