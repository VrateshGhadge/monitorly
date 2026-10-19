import type { AlertEvent } from "../../../types/dashboard";

interface AlertsPanelProps {
  alerts: AlertEvent[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const activeCount = alerts.filter((a) => a.status === "sent").length;

  return (
    <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px] col-span-full" style={{ marginTop: "13px" }}>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="m-0 text-[11px] font-semibold">Email alerts</h4>
        <small>{activeCount} ACTIVE</small>
      </div>
      <div className="flex items-center justify-between border-t border-[#222830] px-1 py-[11px] text-[12px] first:border-t-0">
        <span style={{ color: "var(--muted)" }}>
          Alerts are sent by email to team@acme.dev
        </span>
      </div>
      {alerts.map((a) => (
        <div className="flex items-center justify-between border-t border-[#222830] px-1 py-[11px] text-[12px] first:border-t-0" key={a.id}>
          <div>
            <b className="font-semibold">{a.monitor}</b>
            <div className="mt-0.5 text-[10px] text-[#818994]">
              {a.detail} · {a.time}
            </div>
          </div>
          <span className={`rounded border px-[7px] py-[3px] font-code text-[9px] leading-[normal] ${a.status === "sent" ? "border-[#5c3d1a] text-warning" : "border-[#254d3a] text-brand"}`}>
            {a.status === "sent" ? "SENT" : "RESOLVED"}
          </span>
        </div>
      ))}
    </div>
  );
}
