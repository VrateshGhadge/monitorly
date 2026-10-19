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
    <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px] col-span-full" style={{ marginTop: "13px" }}>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="m-0 text-[11px] font-semibold">All monitors</h4>
        <small>CLICK A ROW TO TOGGLE STATUS</small>
      </div>
      {monitors.map((m) => (
        <MonitorRow key={m.id} monitor={m} onToggle={onToggleMonitor} />
      ))}
    </div>
  );
}
