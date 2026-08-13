import type { Monitor } from "../../../types/dashboard";
import MonitorRow from "../MonitorRow";

interface MonitorsPanelProps {
  monitors: Monitor[];
  onToggleMonitor: (id: string) => void;
}

export default function MonitorsPanel({
  monitors,
  onToggleMonitor,
}: MonitorsPanelProps) {
  return (
    <div className="panel full-panel" style={{ marginTop: "13px" }}>
      <div className="panel-head">
        <h4>All monitors</h4>
        <small>CLICK A ROW TO TOGGLE STATUS</small>
      </div>
      {monitors.map((m) => (
        <MonitorRow key={m.id} monitor={m} onToggle={onToggleMonitor} />
      ))}
    </div>
  );
}
