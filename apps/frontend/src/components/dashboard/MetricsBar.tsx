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
    <div className="grid grid-cols-4 gap-[11px]">
      <div className="rounded-[7px] border border-line bg-[#11151a] p-3">
        <label className="mb-[9px] block text-[10px] text-[#818994]">Monitors up</label>
        <strong className="text-[19px] tracking-[-0.6px]">
          {monitorsUp} <small className="ml-1 text-[10px] text-brand">/ {monitorsTotal}</small>
        </strong>
      </div>
      <div className="rounded-[7px] border border-line bg-[#11151a] p-3">
        <label className="mb-[9px] block text-[10px] text-[#818994]">Uptime · 30 days</label>
        <strong className="text-[19px] tracking-[-0.6px]">
          {avgUptime}
          <small className="ml-1 text-[10px] text-brand">%</small>
        </strong>
      </div>
      <div className="rounded-[7px] border border-line bg-[#11151a] p-3">
        <label className="mb-[9px] block text-[10px] text-[#818994]">Avg response</label>
        <strong className="text-[19px] tracking-[-0.6px]">
          {avgResponse}
          <small className="ml-1 text-[10px] text-brand">ms</small>
        </strong>
      </div>
      <div className="rounded-[7px] border border-line bg-[#11151a] p-3">
        <label className="mb-[9px] block text-[10px] text-[#818994]">Active alerts</label>
        <strong className={`text-[19px] tracking-[-0.6px] ${activeAlerts > 0 ? "text-danger" : ""}`}>
          {String(activeAlerts).padStart(2, "0")}
        </strong>
      </div>
    </div>
  );
}
