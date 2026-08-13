interface MetricsBarProps {
  monitorsUp: number;
  monitorsTotal: number;
  avgUptime: string;
  avgResponse: number;
  activeAlerts: number;
}

export default function MetricsBar({
  monitorsUp,
  monitorsTotal,
  avgUptime,
  avgResponse,
  activeAlerts,
}: MetricsBarProps) {
  return (
    <div className="metrics">
      <div className="metric">
        <label>Monitors up</label>
        <strong>
          {monitorsUp} <small>/ {monitorsTotal}</small>
        </strong>
      </div>
      <div className="metric">
        <label>Uptime · 30 days</label>
        <strong>
          {avgUptime}
          <small>%</small>
        </strong>
      </div>
      <div className="metric">
        <label>Avg response</label>
        <strong>
          {avgResponse}
          <small>ms</small>
        </strong>
      </div>
      <div className="metric">
        <label>Active alerts</label>
        <strong className={activeAlerts > 0 ? "bad" : ""}>
          {String(activeAlerts).padStart(2, "0")}
        </strong>
      </div>
    </div>
  );
}
