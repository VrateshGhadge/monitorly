import type { Monitor } from "../../types/dashboard";

interface MonitorRowProps {
  monitor: Monitor;
  onToggle: (id: string) => void;
}

export default function MonitorRow({ monitor, onToggle }: MonitorRowProps) {
  return (
    <div className="grid cursor-pointer grid-cols-[9px_1.5fr_0.7fr_0.8fr_0.6fr] items-center gap-2 rounded border-t border-[#222830] px-1 py-2.5 text-[10px] hover:bg-[#161b21]" onClick={() => onToggle(monitor.id)}>
      <i
        className="mr-1 inline-block size-1.5 rounded-full bg-brand"
        style={{
          background: monitor.status === "up" ? "var(--green)" : "var(--red)",
        }}
      ></i>
      <b className="text-[11px]">{monitor.name}</b>
      <span className="text-[#85909a]">{monitor.type}</span>
      <span className="text-[#85909a]">{monitor.uptimePct}%</span>
      <span
        className="text-[#85909a]"
        style={{ color: monitor.status === "down" ? "var(--red)" : undefined }}
      >
        {monitor.status === "down" ? "—" : `${monitor.latency}ms`}
      </span>
    </div>
  );
}
